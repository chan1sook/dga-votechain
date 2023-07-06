interface ConfigData {
  homeContentEN: string,
  homeContentTH: string,
  aboutEN: string,
  aboutTH: string,
  contactUsEN: string,
  contactUsTH: string,
  // cookiePolicyEN: string,
  // cookiePolicyTH: string,
  // privacyPolicyEN: string,
  // privacyPolicyTH: string,
  // termAndServiceEN: string,
  // termAndServiceTH: string,
}

type ProtectedKeys = string;

type ConfigModelData = {
  key: string,
  value?: any,
  protected: boolean,
};