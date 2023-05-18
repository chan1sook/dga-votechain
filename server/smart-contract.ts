
import Web3 from "web3";
import Web3NodejsProvider from "web3-nodejs-provider";
import DgaEvoteArtifact from "~/blockchain/build/contracts/DgaEvote.json"

const provider = new Web3NodejsProvider({
  privateKeys: [useRuntimeConfig().BLOCKCHAIN_PRIVATE_KEY],
  providerOrUrl: "http://209.15.108.160:8545"
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
  const response = await DgaEvoteContract.methods.votes(voteid).call();
  return response;
}

export async function addVoteOnBlockchain(voteid: string, topicid: string, userid: string, choice: string | null) {
  const txResponse = await DgaEvoteContract.methods.addVoteData(voteid, topicid, userid, choice || "").send({
    from: provider.getAddress()
  })
  console.log("addVoteData", txResponse);
  return txResponse;
}

export default Object.freeze({
  init,
  getVoteOnBlockchain,
  addVoteOnBlockchain,
});