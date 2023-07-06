interface ConfigData {
  homeContentEN: string,
  homeContentTH: string,
}

type ProtectedKeys = string;

type ConfigModelData = {
  key: string,
  value?: any,
  protected: boolean,
};