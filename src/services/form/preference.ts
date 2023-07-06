export function getDefaultTopMenus() : PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us"]
}

export function getDefaultAdminTopMenus() : PreferenceTopMenuOption[] {
  return getDefaultTopMenus();
}

export function getDefaultDevTopMenus() : PreferenceTopMenuOption[] {
  return getDefaultTopMenus();
}

export function getDefaultAllTopMenus() : PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us"]
}

export function getDefaultAllAdminTopMenus() : PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us"]
}

export function getDefaultAllDevTopMenus() : PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us", "users-management" , "blockchain", "server-config"]
}