
import {} from "mongoose"

declare global {
  type TxChainQueryParams = PaginationParams & {
    keyword?: string,
  }

  interface VoteDataBlockchainOldResponse {
    Choice: string,
    TopicID: string,
    UserID: string,
    VoteID: string,
    BookmarkID?: string,
  }

  interface VoteDataBlockchainResponse {
    voteId: string,
    topicId: string,
    userId: string,
    choice: string,
  }

  type TxStatus = "valid" | "invalid" | "pending";
  type TxResponseData = Omit<VoteDataBlockchainResponse, "choice"> & {
    txhash: string | null,
    choice: string | null,
    createdAt: DateString | undefined,
    txStatus: TxStatus,
  }

  type TxResponseDataFull = TxResponseData & {
    txData?: Object,
  }

  interface TxInfoResponseData {
    servers: Array<BlockchainServerDataResponse>,
    blocks: {
      mined: number,
      total: number,
    }
  }
}