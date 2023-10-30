import { readFiles } from "h3-formidable";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";
import { isBannedUser } from "~/src/services/validations/user";
import { isUserDeveloper } from "~/src/services/validations/role";

const supportMimeTypes = ["application/pdf"];

export default eventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData) || !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { fields, files } = await readFiles(event, {
    includeFields: true,
  });

  const file = files.pdf[0];
  if (!file) {
    throw createError({
      statusMessage: "No Manual PDF File",
      statusCode: 400,
    });
  }

  const tempFile = await fs.readFile(file.filepath);
  const mineTypeResult = await fileTypeFromBuffer(tempFile);
  if (
    !mineTypeResult ||
    !supportMimeTypes.includes(mineTypeResult?.mime) ||
    file.mimetype !== mineTypeResult?.mime
  ) {
    throw createError({
      statusMessage: "Invalid PDF File",
      statusCode: 400,
    });
  }

  // new File name here
  const newFileName = "help-" + nanoid() + ".pdf";
  const helpManualStoragePath = path.resolve(
    useRuntimeConfig().HELP_MANUAL_STORAGE_PATH
  );
  const writePath = path.join(helpManualStoragePath, newFileName);

  await fs.mkdir(helpManualStoragePath, { recursive: true });
  await fs.writeFile(writePath, tempFile);

  return {
    fileName: newFileName,
    status: "OK",
  };
});
