type TxStatus = "valid" | "invalid" | "pending";
  
interface VoteDataBlockchainResponseData {
  voteId: string,
  topicId: string,
  userId: string,
  choice: string,
}

type TxResponseData = Omit<VoteDataBlockchainResponseData, "choice"> & {
  txhash: string | null,
  choice: ChoiceDataType,
  createdAt: DateString | undefined,
  txStatus: TxStatus,
}

type TxResponseDataWithRaw = TxResponseData & {
  txData?: Object,
}

interface BlockchainStatsResponseData {
  servers: BlockchainServerDataResponse[],
  blocks: {
    mined: number,
    total: number,
  }
}