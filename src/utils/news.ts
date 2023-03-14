import dayjs from "dayjs";

export function useWatchNewsDateTimes(
  newsData: Ref<NewsFormData> | Ref<NewsFormEditData>,
  publishDateStr: Ref<string>, publishTimeStr: Ref<string>,
  expiredDateStr: Ref<string>, expiredTimeStr: Ref<string>,
  isNewsExpired: Ref<boolean>
) {
  watch(publishDateStr, (newValue) => {
    const newsPublishAt = dayjs(`${newValue} ${publishTimeStr.value}`, "YYYY-MM-DD HH:MM").toDate();
    const newsExpiredAt = dayjs(newsPublishAt).add(1, "year").toDate();

    newsData.value.newsPublishAt = newsPublishAt;
    newsData.value.newsExpiredAt = isNewsExpired.value ? newsPublishAt : null;
  
    expiredDateStr.value = dayjs(newsExpiredAt).format("YYYY-MM-DD")
    expiredTimeStr.value = dayjs(newsExpiredAt).format("HH:MM")
  });
  watch(publishTimeStr, (newValue) => {
    const newsPublishAt = dayjs(`${publishDateStr.value} ${newValue}`, "YYYY-MM-DD HH:MM").toDate();
    const newsExpiredAt = dayjs(newsPublishAt).add(1, "year").toDate();
  
    newsData.value.newsPublishAt = newsPublishAt;
    newsData.value.newsExpiredAt = isNewsExpired.value ? newsPublishAt : null;
  
    expiredDateStr.value = dayjs(newsExpiredAt).format("YYYY-MM-DD")
    expiredTimeStr.value = dayjs(newsExpiredAt).format("HH:MM")
  });
  watch(expiredDateStr, (newValue) => {
    newsData.value.newsExpiredAt = newValue ? dayjs(`${newValue} ${expiredTimeStr.value}`, "YYYY-MM-DD HH:MM").toDate() : null;
  });
  watch(expiredTimeStr, (newValue) => {
    newsData.value.newsExpiredAt = newValue ? dayjs(`${expiredDateStr.value} ${newValue}`, "YYYY-MM-DD HH:MM").toDate() : null;
  });
  watch(isNewsExpired, (newValue) => {
    newsData.value.newsExpiredAt = newValue ? dayjs(`${expiredDateStr.value} ${expiredTimeStr.value}`, "YYYY-MM-DD HH:MM").toDate() : null;
  });
}

export function isNewsFormValid(newsData: NewsFormData | NewsFormBodyData) {
  return newsData.title !== "" && newsData.content !== "";
}