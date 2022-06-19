import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"
import { AuthTokenError } from "../services/errors/AuthTokenError"
import decode from 'jwt-decode'
import { validateUserPermissions } from "./validateUserPermissions"

type withSSRAuthOptions = {
    permissions?: string[];
    roles?: string[];
}

interface UserDecodeToken { 
    permissions: string[], 
    roles: string[]
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: withSSRAuthOptions) {
    //@ts-ignore
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        // utilizando o nookies no back-end precisamos passar o ctx da requisição como
        // parametro
        const cookies = parseCookies(ctx)

        const token = cookies['nextauth.token']

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }

        if (options) {
            const user = decode<UserDecodeToken>(token)
            const { permissions, roles } = options

            const userHasValidatePermissions = validateUserPermissions({
                user,
                permissions,
                roles
            })
            if (!userHasValidatePermissions){
                return{
                    redirect:{
                        destination: '/dashboard',
                        permanent: false,
                    }
                }
            }
        }


        try {
            return await fn(ctx)

        } catch (err) {
            if (err instanceof AuthTokenError) {
                console.log(err);
                destroyCookie(ctx, 'nextauth.token')
                destroyCookie(ctx, 'nextauth.refreshToken')

                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            }
        }
    }
}