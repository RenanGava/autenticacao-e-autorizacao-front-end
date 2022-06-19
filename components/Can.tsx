import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

type CanProps = {
    permissions?: string[];
    roles?: string[];
    children: ReactNode;
}

export function Can({children, permissions, roles}: CanProps){

    const userCanSeeComponent = useCan({ permissions, roles})

    if (!userCanSeeComponent) {
        return null
    }
    
    return (
        <>
            {children}
        </>
    )
}