type TopicVoteCountResponse = Pick<TopicResponseData, "_id" | "name" | "description" | "choices" | "voteStartAt" | "voteExpiredAt" | "createdAt" | "updatedAt"> & {
  stats: {
    voters: {
      total: number,
      voted: number,
    },
    votes: {
      quota: number,
      actual: number,
    }
  },
  scores: TopicVoteCountRecord[],
  voters?: TopicVoterAllowUserPopulatedData[],
  yourVotes?: ChoiceDataType[],
};

interface TopicVoteCountRecord {
  choice: ChoiceDataType,
  count: number
}

interface TopicChoiceRanking {
  choice: ChoiceDataType,
  rank: number
}