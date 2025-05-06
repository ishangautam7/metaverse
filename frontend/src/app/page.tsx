"use client"

import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { useAuth } from "@/utils/UseAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import HomeGuard from "@/utils/HomeGuard";
import { VideoCallPage } from "./stream/VideoCall";
import { Video } from "lucide-react";
export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  useEffect(() => {
    if (isAuthenticated === true) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <div>
      <HomeGuard>
        <Header />
        <Hero />
      </HomeGuard>
      {/* <VideoCallPage/> */}
    </div>
  )
}