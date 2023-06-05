import { isAdminRole } from "~/src/services/validations/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { id } = to.params;
  const topicid = Array.isArray(id) ? id[id.length - 1] : id;
  const roleMode = useSessionData().value.roleMode;
  
  const currentPath = to.path;
  
  console.log(currentPath)
  if(isAdminRole(roleMode)) {
    if(currentPath !== `/topic/ctrl/${topicid}`) {
      return navigateTo(`/topic/ctrl/${topicid}`)
    }
    return
  }
  
  if(currentPath !== `/topic/vote/${topicid}`) {
    return navigateTo(`/topic/vote/${topicid}`)
  }
})
