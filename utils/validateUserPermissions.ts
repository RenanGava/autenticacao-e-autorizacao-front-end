type User = {
    permissions: string[];
    roles: string[];
}

type ValidateUserPermissionsParams = {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export function validateUserPermissions({ user, permissions, roles }: ValidateUserPermissionsParams) {
    //@ts-ignore
    if (permissions?.length > 0) {
        // metodo every() retorna true ou false, e ele somente vai retornar true
        // quando todos as condições forem verdadeiras.
        const hasAllPermissions = permissions?.every(permission => {
            // utilizando includes se existir as permisões dentro do array[] de 
            // permissions vai retornar true se não existir false.
            return user?.permissions.includes(permission)
        })

        if (!hasAllPermissions) {
            return false
        }
    }

    //@ts-ignore
    if (roles?.length > 0) {
        // metodo some() retorna true ou false, e ele somente vai retornar true
        // quando uma das condições forem verdadeiras.
        const hasAllRoles = roles?.some(role => {
            // utilizando includes se existir as permisões dentro do array[] de 
            // permissions vai retornar true se não existir false.
            return user?.roles.includes(role)
        })

        if (!hasAllRoles) {
            return false
        }
    }

    return true
}