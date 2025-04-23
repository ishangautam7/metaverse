// components/AuthGuard.tsx
"use client"

import { ReactNode } from "react"
import { useAuth } from "./UseAuth"
import { Loading } from "@/components/Loading"

type Props = {
  children: ReactNode
}

const AuthGuard = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || !isAuthenticated) {
    return (
      <Loading />
    )
  }

  return <>{children}</>
}

export default AuthGuard
