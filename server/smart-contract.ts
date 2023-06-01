
import Web3 from "web3";
import Web3NodejsProvider from "web3-nodejs-provider";
import DgaEvoteArtifact from "~/blockchain/build/contracts/DgaEvote.json"
import axios from "axios"

const isProduction = !process.env.IS_DEV && process.env.NODE_ENV === "production";
const rpcURL = isProduction ? "http://127.0.0.1:8545" : "http://209.15.108.160:8545";

const provider = new Web3NodejsProvider({
  privateKeys: [useRuntimeConfig().BLOCKCHAIN_PRIVATE_KEY],
  providerOrUrl: rpcURL
});

const web3 = new Web3(provider);
const address = DgaEvoteArtifact.networks[1337].address;
const DgaEvoteContract = new web3.eth.Contract(DgaEvoteArtifact.abi, address);

export function init() {
  try {
    console.log("contract", DgaEvoteContract.methods);
    console.log("contractOwner", provider.getAddress());
  } catch(err) {
    console.error(err);
  }
}

export async function getVoteOnBlockchain(voteid: string) : Promise<VoteDataBlockchainResponse> {
  if(!isProduction) {
    throw new Error("Is not production");
  }

  const response = await DgaEvoteContract.methods.votes(voteid).call();
  return response;
}

export async function addVoteOnBlockchain(voteid: string, topicid: string, userid: string, choice: ChoiceDataType) {
  if(!isProduction) {
    throw new Error("Is not production");
  }
  
  const txResponse = await DgaEvoteContract.methods.addVoteData(voteid, topicid, userid, choice || "").send({
    from: provider.getAddress()
  })
  console.log("addVoteData", txResponse);
  return txResponse;
}

export async function getTransactionByHash(txhash: string) {
  if(!isProduction) {
    throw new Error("Is not production");
  }
  
  const result = await axios.post(rpcURL, {
    "jsonrpc": "2.0",
    "method": "eth_getTransactionByHash",
    "params": [txhash],
    "id": 1
  }, {
    headers: {}
  });

  return result.data.result;
}

export default Object.freeze({
  init,
  getVoteOnBlockchain,
  addVoteOnBlockchain,
  getTransactionByHash,
});