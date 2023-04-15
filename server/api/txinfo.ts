import VoteModel from "~~/server/models/vote"

export default defineEventHandler(async (event) => {
  const voteTotal = await VoteModel.countDocuments();
  const blocks = Math.ceil(voteTotal / 32);
  return {
    server: {
      online: 1,
      total: 1,
    },
    blocks: {
      mined: blocks > 0 ? blocks - 1 : 0,
      total: blocks,
    }
  }
})