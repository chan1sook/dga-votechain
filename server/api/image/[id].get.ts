import fs from "fs/promises";
import path from 'path';

export default eventHandler(async (event) => {
  const fileName = event.context.params?.id;
  if(!fileName) {
    throw createError({
      statusMessage: "Not found",
      statusCode: 404,
    })
  }
  const imgStoragePath = path.resolve(useRuntimeConfig().IMG_STORAGE_PATH);
  const imageActualPath = path.join(imgStoragePath, fileName);
  const file = await fs.readFile(imageActualPath);

  // setResponseHeader(event, "")
  return file;
})