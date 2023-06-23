type TopicFilterParams = 
  ({ type: "all" } |
  { 
    type: "date", 
    year: number,
    month: number,
  } |
  {
    type: "ticketId",
    ticketId: string,
  } |
  {
    type: "topicName",
    keyword: string,
  }
  ) & {
    topicType: "all" | TopicType,
  } & PaginationParams;