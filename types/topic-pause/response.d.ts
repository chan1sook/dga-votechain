type TopicCtrlPauseResponseData = Omit<TopicCtrlPauseModelData, "topicid" | "pauseAt" | "resumeAt"> & {
  topicid: string;
  pauseAt: DateString;
  resumeAt?: DateString;
}