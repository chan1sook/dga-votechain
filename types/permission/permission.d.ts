declare global {
  type EVotePermissionBasic = "request-permissions";
  type EVotePermissionVoter = "voter-mode" | "vote-topic" | "request-topic" ;
  type EVotePermissionAdmin = "admin-mode" | "create-topic" | "change-topic" | "create-news" | "change-news" | "change-permissions:basic";
  type EVotePermissionDeveloper = "dev-mode" | "change-permissions:advance";
  
  type EVotePermissionUnused = "access-pages:user" | "access-notifications" | "transfer-topic-controller"  | "grant-topic-controller" | "access-pages:admin" | "access-pages:developer";
  type EVotePermission = EVotePermissionBasic | EVotePermissionVoter | EVotePermissionAdmin | EVotePermissionDeveloper | EVotePermissionUnused;
 
  type EVoteActivePermission = Exclude<EVotePermission, EVotePermissionUnused>;
}  