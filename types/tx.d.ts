
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
    voteid: string,
    topicid: string,
    userid: string,
    choice: string,
  }

  type TxResponseOldData = {
    TopicID: string,
    UserID: string,
    VoteID: string,
    Choice: string | null,
    CreatedAt: DateString,
    BookmarkID?: string,
    Mined: boolean,
  }
  type TxResponseData = Omit<VoteDataBlockchainResponse, "choice"> & {
    choice: string | null,
    createdAt: DateString | undefined,
    valid: boolean,
    mined: boolean,
  }
  interface TxInfoResponseData {
    server: {
      online: number,
      total: number,
    },
    blocks: {
      mined: number,
      total: number,
    }
  }
}