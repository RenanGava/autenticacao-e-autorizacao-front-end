import { useAuth } from "../contexts/AuthContexts";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type useCanParams = {
    permissions?: string[];
    roles?: string[];
}

export function useCan({ permissions, roles }: useCanParams) {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated){
        return false
    }

    const userHasValidatePermissions = validateUserPermissions({
        //@ts-ignore
        user,
        permissions,
        roles
    })

    return userHasValidatePermissions
}