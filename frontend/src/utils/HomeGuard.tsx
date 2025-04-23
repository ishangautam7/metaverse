"use client"

import { ReactNode, useEffect } from "react"
import { useAuth } from "./UseAuth"
import { useRouter } from "next/navigation"
import { Loading } from "@/components/Loading"

type Props = {
  children: ReactNode
}

const HomeGuard = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading || isAuthenticated === true) {
    return <Loading /> 
  }

  return <>{children}</>
}

export default HomeGuard
