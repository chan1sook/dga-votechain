export function getDefaultTopMenus(): PreferenceTopMenuOption[] {
  return ["home", "about", "help", "contact-us"];
}

export function getDefaultVoterTopMenus(): PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us"];
}

export function getDefaultAdminTopMenus(): PreferenceTopMenuOption[] {
  return getDefaultVoterTopMenus();
}

export function getDefaultDevTopMenus(): PreferenceTopMenuOption[] {
  return getDefaultVoterTopMenus();
}

export function getDefaultAllTopMenus(): PreferenceTopMenuOption[] {
  return ["home", "about", "help", "contact-us"];
}

export function getDefaultAllVoterTopMenus(): PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us"];
}

export function getDefaultAllAdminTopMenus(): PreferenceTopMenuOption[] {
  return ["home", "voting", "about", "help", "contact-us"];
}

export function getDefaultAllDevTopMenus(): PreferenceTopMenuOption[] {
  return [
    "home",
    "voting",
    "about",
    "help",
    "contact-us",
    "users-management",
    "blockchain",
    "server-config",
  ];
}
