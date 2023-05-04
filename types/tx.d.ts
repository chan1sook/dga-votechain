
import {} from "mongoose"

declare global {
  type TxChainQueryParams = PaginationParams & {
    keyword?: string,
  }

  interface VoteDataBlockchainRespose {
    Choice: string,
    TopicID: string,
    UserID: string,
    VoteID: string,
    BookmarkID?: string,
  }

  type TxResponseData = {
    TopicID: string,
    UserID: string,
    VoteID: string,
    Choice: string | null,
    CreatedAt: DateString,
    BookmarkID?: string,
    Mined: boolean,
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