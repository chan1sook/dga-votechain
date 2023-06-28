import { readFiles } from 'h3-formidable'
import { checkPermissionNeeds } from '~/src/services/validations/permission';
import { fileTypeFromBuffer } from "file-type"
import sharp from 'sharp';
import fs from "fs/promises";
import { nanoid } from 'nanoid';
import path from 'path';
import { isBannedUser } from '~/src/services/validations/user';


const supportMimeTypes = ['image/jpeg', 'image/png'];

export default eventHandler(async (event) => {
  const userData = event.context.userData;
  
  if(!userData || isBannedUser(userData) || !checkPermissionNeeds(userData.permissions, "admin-mode")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const { fields, files } = await readFiles(event, {
    includeFields: true
  })

  const file = files.image[0];
  if(!file) {
    throw createError({
      statusMessage: "No Image File",
      statusCode: 400,
    })
  }

  const tempFile = await fs.readFile(file.filepath);
  const mineTypeResult = await fileTypeFromBuffer(tempFile);
  if(!mineTypeResult || !supportMimeTypes.includes(mineTypeResult?.mime) || file.mimetype !== mineTypeResult?.mime) {
    throw createError({
      statusMessage: "Invalid Image File",
      statusCode: 400,
    })
  }

  const buffer = await sharp(tempFile).resize(400, 400, {
    fit: "inside"
  }).png().toBuffer()
  
  // new File name here
  const newFileName = "img-" + nanoid() + ".png"
  const imgStoragePath = path.resolve(useRuntimeConfig().IMG_STORAGE_PATH);
  const writePath = path.join(imgStoragePath, newFileName);

  await fs.mkdir(imgStoragePath, { recursive: true });
  await fs.writeFile(writePath, buffer);

  return {
    fileName: newFileName,
    status: "OK"
  }
})