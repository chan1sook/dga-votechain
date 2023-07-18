interface CoadminFormData {
  userid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

type VoterAllowFormData = CoadminFormData & {
  totalVotes: number;
};

type UserSearchTableData = CoadminFormData | VoterAllowFormData;
