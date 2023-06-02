interface VoterAllowFormData {
  userid?: string,
  email?: string,
  firstName?: string,
  lastName?: string,
  totalVotes: number,
}

type CoadminFormData = Omit<VoterAllowFormData, "totalVotes">