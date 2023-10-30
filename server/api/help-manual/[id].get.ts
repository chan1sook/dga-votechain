import fs from "fs/promises";
import path from "path";

export default eventHandler(async (event) => {
  const fileName = event.context.params?.id;
  if (!fileName) {
    throw createError({
      statusMessage: "Not found",
      statusCode: 404,
    });
  }
  const helpManualStoragePath = path.resolve(
    useRuntimeConfig().HELP_MANUAL_STORAGE_PATH
  );
  const pdfActualPath = path.join(helpManualStoragePath, fileName);
  const file = await fs.readFile(pdfActualPath);

  // setResponseHeader(event, "")
  return file;
});
