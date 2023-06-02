type TopicCardStatus = "waiting" | "access" | "voting" | "voted" | "finished" | "result";

type TopicFormData = Omit<TopicModelData, "status" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "votePauseAt" | "pauseDuration" | "admin" | "coadmins"> & {
  voterAllows: VoterAllowFormData[],
  coadmins: string[],
};

type TopicFormBodyData = Omit<TopicFormData, "voteStartAt" | "voteExpiredAt"> & {
  voteStartAt: DateString,
  voteExpiredAt: DateString
};

type TopicFormEditData = TopicFormData & Pick<TopicModelData, "status">;
type TopicFormEditBodyData = TopicFormBodyData & Pick<TopicModelData, "status">;