const allSupportLocales = ["th", "en"];

export function mapConfigKeysToAllLocales(...keys: string[]) {
  const result : string[] = [];
  const supportLocales = allSupportLocales.map((ele) => ele.toUpperCase());
  for(const key of keys) {
    for(const locale of supportLocales) {
      result.push(`${key}${locale}`)
    }
  }

  return result;
}

export function getStringConfigFieldByLocale(baseName: string, locale: string, serverConfigs: Record<string, any>) {
  let result = "";
  const supportLocales : string[] = [];
  if(allSupportLocales.includes(locale)) {
    supportLocales.push(locale);
  }

  supportLocales.push(...allSupportLocales.filter((ele) => ele !== locale));

  for(const locale of supportLocales) {
    const key = `${baseName}${locale.toUpperCase()}`;
    const value = serverConfigs[key];
    if(value !== '') {
        return `${value}`
    }
  }
  
  return "";
}