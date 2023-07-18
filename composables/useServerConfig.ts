export const useServerConfig = async (filterkeys?: string[]) => {
  const result: Partial<ConfigData> = {};
  if (Array.isArray(filterkeys) && filterkeys.length > 0) {
    const params = new URLSearchParams();
    params.set("fields", JSON.stringify(filterkeys));
    const { data } = await useFetch(`/api/config/get?${params}`);

    if (data.value) {
      Object.assign(result, data.value);
    }
  }

  return result;
};
