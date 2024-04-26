import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import DgaEvoteArtifact from "~/blockchain/build/contracts/DgaEvote.json";
import axios from "axios";

const { IS_PRODUCTION, BLOCKCHAIN_HOST, BLOCKCHAIN_PRIVATE_KEY } =
  useRuntimeConfig();

const rpcURL = `http://${BLOCKCHAIN_HOST || "127.0.0.1"}:8545`;

const provider = new HDWalletProvider({
  privateKeys: [BLOCKCHAIN_PRIVATE_KEY],
  providerOrUrl: rpcURL,
});

const web3 = new Web3(provider);
const address = DgaEvoteArtifact.networks[1337].address;
const DgaEvoteContract = new web3.eth.Contract(DgaEvoteArtifact.abi, address);

export function test() {
  try {
    console.log("contract", Object.keys(DgaEvoteContract.methods));
    console.log("contractOwner", provider.getAddress());
  } catch (err) {
    console.error(err);
  }
}

export async function getVoteOnBlockchain(
  voteid: string
): Promise<VoteDataBlockchainResponseData> {
  if (IS_PRODUCTION !== "true") {
    throw new Error("Is not production");
  }

  const response = await DgaEvoteContract.methods.votes(voteid).call();
  return response;
}

export async function addVoteOnBlockchain(
  voteid: string,
  topicid: string,
  userid: string,
  choice: ChoiceDataType
) {
  if (IS_PRODUCTION !== "true") {
    throw new Error("Is not production");
  }

  const txResponse = await DgaEvoteContract.methods
    .addVoteData(voteid, topicid, userid, choice || "")
    .send({
      from: provider.getAddress(),
    });
  console.log("addVoteData", txResponse);
  return txResponse;
}

export async function getTransactionByHash(txhash: string) {
  if (IS_PRODUCTION !== "true") {
    throw new Error("Is not production");
  }

  const result = await axios.post(
    rpcURL,
    {
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [txhash],
      id: 1,
    },
    {
      headers: {},
    }
  );

  return result.data.result;
}

export default Object.freeze({
  test,
  getVoteOnBlockchain,
  addVoteOnBlockchain,
  getTransactionByHash,
});
