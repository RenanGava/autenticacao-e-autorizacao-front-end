import { useEffect } from "react"
import { Can } from "../components/Can"
import { useAuth } from "../contexts/AuthContexts"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"

import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {

    const { user, singnOut } = useAuth()

    useEffect(() => {
        api.get('/me').then(response => response)
    }, [])

    return (
        <>
            <h1>{user?.email}</h1>

            <button onClick={singnOut}>Sign Out</button>

            <Can permissions={['metrics.list']}>
                <div>Metricas</div>
            </Can>
        </>
    )
}


export const getServerSideProps = withSSRAuth(async (ctx) => {
    //@ts-ignore
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');

    return {
        props: {}
    }
});