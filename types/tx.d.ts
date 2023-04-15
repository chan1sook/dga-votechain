
import {} from "mongoose"

declare global {
  type TxChainQueryParams = PaginationParams & {
    keyword?: string,
  }

  type TxResponseData = Omit<VoteData, "_id" | "userid" | "topicid" | "createdAt"> & {
    _id: string,
    userid: string,
    topicid: string,
    createdAt: DateString,
  }

  type TxResponseDataWithPopulated = Omit<TxResponseData, "userid" | "topicid"> & {
    userid: {
      _id: string,
      firstName?: string,
      lastName?: string,
      email?: string
    },
    topicid: {
      _id: string,
      name: string,
      voteStartAt: DateString,
      voteExpiredAt: DateString,
    },
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