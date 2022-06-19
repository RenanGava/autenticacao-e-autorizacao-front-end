import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies'
import { singnOut } from '../contexts/AuthContexts';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false
//@ts-ignore
let failedRequestsQueue = []

export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx)

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    })
    
    api.interceptors.response.use(response => {
        return response
    }, (error: AxiosError) => {
        if (error.response?.status === 401) {
            //@ts-ignore
            if (error.response.data?.code === 'token.expired') {
                cookies = parseCookies(ctx)
    
                const { 'nextauth.refreshToken': refreshToken } = cookies
    
                // possui todas as informaçòes que precisa para ser feita uma nova
                // requisição do token
                const originalConfig = error.config
    
                if (!isRefreshing) {
                    isRefreshing = true
                    

                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        const { token } = response.data
    
    
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/',
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/',
                        })
                        //@ts-ignore
                        api.defaults.headers['Authorization'] = `Bearer ${token}`
    
                        //@ts-ignore
                        failedRequestsQueue.forEach(request => { request.onSuccess(token) })
                        failedRequestsQueue = []
                    }).catch(err => {
                        //@ts-ignore
                        failedRequestsQueue.forEach(request => { request.onFailure(err) })
                        failedRequestsQueue = []
                        
                        //@ts-ignore
                        if (process.browser){
                            singnOut()
                        }
                    }).finally(() => {
                        isRefreshing = false
                    })
                }
    
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            //@ts-ignore
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
    
                            resolve(api(originalConfig))
                        },
                        onFailure: (err: AxiosError) => {
                            reject(err)
                        }
                    })
                })
            } else {
                //@ts-ignore
                if (process.browser){
                    singnOut()
                } else{
                    return Promise.reject(new AuthTokenError)
                }
            }
        }
        return Promise.reject(error)
    })

    return api
}