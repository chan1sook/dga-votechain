export default defineEventHandler(async (event) => {
  console.log("Test host", getRequestHost(event));
  return {
    status: "OK",
  };
})