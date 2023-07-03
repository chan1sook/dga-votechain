import { FilterQuery } from "mongoose";
import ConfigModel from "~/src/models/config"

export function getConfigurations(filterKeys?: string[], withProtected?: boolean) {
  const query : FilterQuery<ConfigModelData> = {
    protected: { $ne: true }
  };

  if(Array.isArray(filterKeys) && filterKeys.length > 0) {
    query.key = { $in: filterKeys };
  }

  if(withProtected) {
    delete query.protected;
  }

  return ConfigModel.find(query);
};

export async function updateConfigurations(config: {[key : string]: any}, createNew?: boolean) {
  const configKeys = Object.keys(config);
  const existsConfigs = await getConfigurations(configKeys);
  for(const configDoc of existsConfigs) {
    configDoc.value = config[configDoc.key];
  }

  if(createNew) {
    const existsKeys = existsConfigs.map((ele) => ele.key);
    const nonExistsKeys = configKeys.filter((k) => !existsKeys.includes(k))
    for(const key of nonExistsKeys) {
      existsConfigs.push(new ConfigModel({
        key: key,
        value: config[key],
      }));
    }
  }

  return await ConfigModel.bulkSave(existsConfigs);
}