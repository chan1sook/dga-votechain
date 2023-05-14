/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { ChaincodeEvent, CloseableAsyncIterable, connect, Contract, Gateway, GatewayError, Network, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';
import { getEventEmitter } from './global-emitter';

const channelName = 'mychannel';
const chaincodeName = 'evote';
const mspId = 'Org1MSP';

// Path to crypto materials.
const cryptoPath = path.join('/home/logisense/fabric-evote/fabric-samples/test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
// Path to user private key directory.
const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
// Path to user certificate.
const certPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem');
// Path to peer tls certificate.
const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
// Gateway peer endpoint.
const peerEndpoint = 'localhost:7051';
// Gateway peer SSL host name override.
const peerHostAlias = 'peer0.org1.example.com';
const utf8Decoder = new TextDecoder();

let firstEvoteResultID = "topic1";
let firstEvoteResultChoice = "A";

const eventEmitter = getEventEmitter();

function isHyperledgerAvailable() {
  return process.env.NODE_ENV !== 'production';
}

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': peerHostAlias,
  });
}

async function newIdentity() {
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function newSigner() {
  const files = await fs.readdir(keyDirectoryPath);
  const keyPath = path.resolve(keyDirectoryPath, files[0]);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function waitConnection() {
  const client = await newGrpcConnection();

  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    // Default timeouts for different gRPC calls
    evaluateOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    endorseOptions: () => {
        return { deadline: Date.now() + 15000 }; // 15 seconds
    },
    submitOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    commitStatusOptions: () => {
        return { deadline: Date.now() + 60000 }; // 1 minute
    },
  });
  return gateway;
}

function getContract(gateway: Gateway, name: string) {
  const network = gateway.getNetwork(channelName);
  return network.getContract(chaincodeName, name);
}

export const writeVoteDataToBlockchain = async function (voteData : VoteDataBlockchainInput) {
  if(!isHyperledgerAvailable()) {
    throw new Error("Hyperleader N/A");
  }

  const gateway = await waitConnection();
  const contract = getContract(gateway, "EvoteVote");

  console.log('Submit Transaction: CreateEvote');
  const resultBytes = await contract.submitTransaction('CreateEvote', 
    voteData._id.toString(),
    voteData.topicid.toString(),
    voteData.userid.toString(),
    voteData.choice === null ? '' : voteData.choice,
  );
  const resultJSON = utf8Decoder.decode(resultBytes);
  const resultData = JSON.parse(resultJSON);
  console.log('*** Result:', resultData);

  eventEmitter.emit("txmined", resultData);
  return resultData;
}

export const writeManyVoteDataToBlockchain = async function (...votesData : Array<VoteDataBlockchainInput>) {
  if(!isHyperledgerAvailable()) {
    throw new Error("Hyperleader N/A");
  }

  for(const voteData of votesData) {
    await writeVoteDataToBlockchain(voteData);
  }
}

export const queryVoteDatasFromBlockchain = async function (pagesize: number, startid: string | undefined) : Promise<Array<VoteDataBlockchainRespose>> {
  if(!isHyperledgerAvailable()) {
    throw new Error("Hyperleader N/A");
  }

  const gateway = await waitConnection();
  const contract = getContract(gateway, "EvoteVote");

  console.log('Evaluate Transaction: GetEvotesAll');

  const resultBytes = await contract.evaluateTransaction('GetEvotesAll', pagesize.toString(), startid || "");
  const resultJSON = utf8Decoder.decode(resultBytes);
  const resultData = JSON.parse(resultJSON);
  console.log('*** Result:', resultData);
  return resultData;
}

export const queryVoteDatasByIdFromBlockchain = async function (voteid: string) : Promise<VoteDataBlockchainRespose> {
  if(!isHyperledgerAvailable()) {
    throw new Error("Hyperleader N/A");
  }

  const gateway = await waitConnection();
  const contract = getContract(gateway, "EvoteVote");

  console.log(`Evaluate Transaction: GetEvoteByVoteId ${voteid}`);
  const resultBytes = await contract.evaluateTransaction('GetEvoteByVoteId', voteid);
  const resultJSON = utf8Decoder.decode(resultBytes);
  const resultData = JSON.parse(resultJSON);
  console.log('*** Result:', resultData);
  return resultData;
}

export const queryVoteDatasByTopicIdFromBlockchain = async function (topicid: string, pagesize: number, startid: string | undefined) : Promise<Array<VoteDataBlockchainRespose>> {
  if(!isHyperledgerAvailable()) {
    throw new Error("Hyperleader N/A");
  }

  const gateway = await waitConnection();
  const contract = getContract(gateway, "EvoteVote");

  console.log(`Evaluate Transaction: GetEvotesByTopicId ${topicid}`);
  const resultBytes =  await contract.evaluateTransaction('GetEvotesByTopicId', topicid, pagesize.toString(), startid || "");
  const resultJSON = utf8Decoder.decode(resultBytes);
  const resultData = JSON.parse(resultJSON);
  console.log('*** Result:', resultData);
  return resultData;
}

async function startEventListening(network: Network): Promise<CloseableAsyncIterable<ChaincodeEvent>> {
  console.log('*** Start chaincode event listening');

  const events = await network.getChaincodeEvents(chaincodeName);

  void readEvents(events); // Don't await - run asynchronously
  return events;
}

async function readEvents(events: CloseableAsyncIterable<ChaincodeEvent>): Promise<void> {
  try {
    for await (const event of events) {
      const resultJSON = utf8Decoder.decode(event.payload);
      const payload = JSON.parse(resultJSON);
      console.log(`Chaincode event received: ${event.eventName} -`, payload);
    }
  } catch (error: unknown) {
    // Ignore the read error when events.close() is called explicitly
    if (!(error instanceof GatewayError) || error.code !== grpc.status.CANCELLED) {
        throw error;
    }
  }
}

/**
 * Evaluate a transaction to query ledger state.
 */
/**
 * @param {Contract} contract
 */
async function getEvoteResultsAll(contract: Contract) {
    console.log('\n--> Evaluate Transaction: GetEvoteResultsAll');

    let resultBytes = await contract.evaluateTransaction('GetEvoteResultsAll');
    let resultJson = utf8Decoder.decode(resultBytes);
    console.log('*** Result:',  JSON.parse(resultJson));
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
/**
 * @param {Contract} contract
 */
async function createEvoteResults(contract: Contract) {
    console.log('\n--> Submit Transaction: createEvoteResults x4');
    let topicid = `topicid-${Date.now()}`;
    let choice = "A";
    firstEvoteResultID = topicid;
    firstEvoteResultChoice = choice;
    let resultBytes = await contract.submitTransaction('CreateEvoteResult', topicid, choice, "200", "1");
    let resultJSON = utf8Decoder.decode(resultBytes);
    console.log('*** Result:', JSON.parse(resultJSON));

    choice = "B";
    resultBytes = await contract.submitTransaction('CreateEvoteResult', topicid, choice, "50", "2");
    resultJSON = utf8Decoder.decode(resultBytes);
    console.log('*** Result:', JSON.parse(resultJSON));

    topicid = `voteid-${Date.now()}`;
    choice = "A";
    resultBytes = await contract.submitTransaction('CreateEvoteResult', topicid, choice, "300", "1");
    resultJSON = utf8Decoder.decode(resultBytes);
    console.log('*** Result:', JSON.parse(resultJSON));

    choice = "B";
    resultBytes = await contract.submitTransaction('CreateEvoteResult', topicid, choice, "60", "2");
    resultJSON = utf8Decoder.decode(resultBytes);
    console.log('*** Result:', JSON.parse(resultJSON));

    console.log('*** Transaction committed successfully');
}

/**
 * @param {Contract} contract
 */
async function checkEvoteResults(contract: Contract) {
    console.log(`\n--> Evaluate Transaction: EvoteResultExists ${firstEvoteResultID},${firstEvoteResultChoice}`);
    let resultBytes = await contract.evaluateTransaction('EvoteResultExists', firstEvoteResultID, firstEvoteResultChoice);
    let resultJson = utf8Decoder.decode(resultBytes);
    console.log(`*** Result:`, JSON.parse(resultJson));
    console.log('\n--> Evaluate Transaction: EvoteResultExists topicid1,A');
    resultBytes =  await contract.evaluateTransaction('EvoteResultExists', 'topicid1', 'A');
    resultJson = utf8Decoder.decode(resultBytes);
    console.log(`*** Result:`, JSON.parse(resultJson));
}

/**
 * @param {Contract} contract
 */
async function readEvoteResults(contract: Contract) {
    console.log(`\n--> Evaluate Transaction: GetEvoteResultsByTopicId ${firstEvoteResultID}`);
    let resultBytes =  await contract.evaluateTransaction('GetEvoteResultsByTopicId', firstEvoteResultID);
    let resultJson = utf8Decoder.decode(resultBytes);
    console.log(`*** Result:`, JSON.parse(resultJson));

    console.log(`\n--> Evaluate Transaction: GetEvoteResultByKey ${firstEvoteResultID},${firstEvoteResultChoice}`);
    resultBytes = await contract.evaluateTransaction('GetEvoteResultByKey', firstEvoteResultID, firstEvoteResultChoice);
    resultJson = utf8Decoder.decode(resultBytes);
    console.log(`*** Result:`, JSON.parse(resultJson));
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
function displayInputParameters() {
  console.log(`channelName:       ${channelName}`);
  console.log(`chaincodeName:     ${chaincodeName}`);
  console.log(`mspId:             ${mspId}`);
  console.log(`cryptoPath:        ${cryptoPath}`);
  console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
  console.log(`certPath:          ${certPath}`);
  console.log(`tlsCertPath:       ${tlsCertPath}`);
  console.log(`peerEndpoint:      ${peerEndpoint}`);
  console.log(`peerHostAlias:     ${peerHostAlias}`);
}

export default async function hyperleaderTest() {
  displayInputParameters();

  if(!isHyperledgerAvailable()) {
    console.warn("Hyperleader N/A");
    return;
  }

  try {
    const gateway = await waitConnection();
    const network = gateway.getNetwork(channelName);
    startEventListening(network);
  } catch(err) {
    console.error(err);
  }
}