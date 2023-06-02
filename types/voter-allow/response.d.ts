type VoterAllowResponseData = Omit<VoterAllowModelData, "topicid" | "userid"> & {
  topicid: string,
  userid: string,
}