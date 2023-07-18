interface UserEditFormData {
  firstName: string;
  lastName: string;
  email: string;
  isGovOfficer: boolean;
  ministry: string;
  department: string;
  division: string;
}

interface UserPreferencesForm {
  userInfo: UserEditFormData;
  topMenu: UserPreferencesTopMenu;
}
