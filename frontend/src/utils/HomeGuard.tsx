"use client"

import { ReactNode } from "react"
import { useAuth } from "./UseAuth"
import { Loading } from "@/components/Loading"

type Props = {
  children: ReactNode
}

const HomeGuard = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || isAuthenticated === true) {
    return <Loading /> 
  }

  return <>{children}</>
}

export default HomeGuard
