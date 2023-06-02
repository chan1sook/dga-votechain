type RequestPermissionPreset = "moderator" | "developer" | "custom";
type RequestPermissionStatus = "pending" | "approved" | "rejected";

type RequestPermissionsFormData = Omit<RequestPermissionsModelData, "_id" | "userid" | "status" | "digitalIdUserInfo" | "createdAt" | "updatedAt">;
type RequestPermissionsApproveFormData = {
  status: Exclude<RequestPermissionStatus, "pending">,
};