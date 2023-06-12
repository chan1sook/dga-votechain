type VoterAllowResponseData = Omit<VoterAllowModelData, "topicid" | "userid"> & {
  topicid: string,
  userid: string,
}


type VoterAllowVoteData = VoterAllowFormData;

interface RawVoterAllowVoteData {
  _id: string,
  remainVotes: number,
}
