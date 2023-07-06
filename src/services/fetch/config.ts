import { FilterQuery } from "mongoose";
import ConfigModel from "~/src/models/config"

const SERVER_CONFIGURATIONS : ConfigData = {
  homeContentTH: "",
  homeContentEN: "",
};

const protectedKeys: ProtectedKeys[] = [];

export function isProtectedConfigKey(key: string) {
  return protectedKeys.includes(key);
}

export function getServerConfigurations(filterKeys?: string[], withProtected?: boolean) {
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

export function getFastConfiguration(filterKeys?: string[], withProtected?: boolean) {
  const result: Partial<ConfigData> = {};
  const keys = Array.isArray(filterKeys) && filterKeys.length > 0 ? filterKeys : Object.keys(SERVER_CONFIGURATIONS);
  for(const key of keys) {
    if(withProtected || !isProtectedConfigKey(key)) {
      (result as Record<string, any>)[key] = (SERVER_CONFIGURATIONS as Record<string, any>)[key];
    }
  }
  return result;
}

export async function updateConfigurations(config: Partial<ConfigData>, createNew?: boolean) {
  const configKeys = Object.keys(config);
  const existsConfigs = await getServerConfigurations(configKeys);
  for(const configDoc of existsConfigs) {
    configDoc.value = (config as Record<string,any>)[configDoc.key];
    configDoc.protected = isProtectedConfigKey(configDoc.key);
  }

  if(createNew) {
    const existsKeys = existsConfigs.map((ele) => ele.key);
    const nonExistsKeys = configKeys.filter((k) => !existsKeys.includes(k))
    for(const key of nonExistsKeys) {
      existsConfigs.push(new ConfigModel({
        key: key,
        value: (config as Record<string,any>)[key],
        protected: isProtectedConfigKey(key),
      }));
    }
  }

  return await ConfigModel.bulkSave(existsConfigs);
}

export async function loadServerConfigurations() {
  const configsDocs = await getServerConfigurations();
  for(const configDoc of configsDocs) {
    (SERVER_CONFIGURATIONS as Record<string, any>)[configDoc.key] = configDoc.value;
  }
}