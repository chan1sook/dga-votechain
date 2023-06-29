type TopicResponseData = Omit<TopicFormBodyData, "voterAllows" | "admin" | "coadmins"> & Pick<TopicModelData, "status"> & {
  _id: string,
  createdAt: DateString,
  updatedAt: DateString,
  createdBy?: UserBasicResponseDataWithId,
  updatedBy: string,
  admin: string,
  coadmins: string[],
};

type TopicResponseDataExtended = TopicResponseData & {
  canVote: boolean,
  quota: number,
  voted: number,
  pauseData: TopicCtrlPauseResponseData[]
}

type TopicResultResponse = Pick<TopicResponseData, "_id" | "name" | "description" | "type" | "choices" | "voteStartAt" | "voteExpiredAt" | "createdAt" | "updatedAt"> & {
  createdBy?: UserBasicResponseDataWithId,
  stats: {
    voters: {
      total: number,
      voted: number,
    },
    votes: {
      quota: number,
      anonymous: number,
      user: number,
    }
  },
  scores: TopicVoteCountRecord[],
  voters?: VoterAllowModelDataUserPopulated[],
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