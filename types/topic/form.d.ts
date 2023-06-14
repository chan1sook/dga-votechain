type TopicCardStatus = "waiting" | "access" | "voting" | "voted" | "finished" | "result";

type TopicFormData = Omit<TopicModelData, "status" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "votePauseAt" | "pauseDuration" | "admin" | "coadmins"> & {
  voterAllows: VoterAllowFormData[],
  coadmins: string[],
  images: (File | false | undefined)[]
};

type TopicFormBodyData = Omit<TopicFormData, "voteStartAt" | "voteExpiredAt" | "images"> & {
  voteStartAt: DateString,
  voteExpiredAt: DateString
};

type TopicFormEditData = TopicFormData & Pick<TopicModelData, "status">;
type TopicFormEditBodyData = TopicFormBodyData & Pick<TopicModelData, "status">;