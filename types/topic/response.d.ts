type TopicResponseData = Omit<TopicFormBodyData, "voterAllows" | "admin" | "coadmins"> & Pick<TopicModelData, "status"> & {
  _id: string,
  createdAt: DateString,
  updatedAt: DateString,
  createdBy: UserBasicResponseDataWithId,
  updatedBy: string,
  admin: string,
  coadmins: string[],
};

type TopicResponseDataExtended = TopicResponseData & {
  voterAllow?: VoterAllowResponseData,
  pauseData: TopicCtrlPauseResponseData[]
}

type TopicResultResponse = Pick<TopicResponseData, "_id" | "name" | "description" | "choices" | "voteStartAt" | "voteExpiredAt" | "createdAt" | "updatedAt"> & {
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
  voters?: VoterAllowUserPopulatedData[],
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