type EVotePermissionBasic = "request-permissions";
type EVotePermissionVoter = "voter-mode" | "vote-topic";
type EVotePermissionAdmin = "admin-mode" | "create-topic" | "change-topic" | "control-topic" | "create-news" | "change-news";
type EVotePermissionDeveloper = "dev-mode" | "change-permissions";

type EVotePermissionUnused = "request-topic" | "change-permissions:basic" | "change-permissions:advance";
type EVotePermission = EVotePermissionBasic | EVotePermissionVoter | EVotePermissionAdmin | EVotePermissionDeveloper | EVotePermissionUnused;

type EVoteActivePermission = Exclude<EVotePermission, EVotePermissionUnused>;