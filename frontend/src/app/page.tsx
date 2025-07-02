"use client"

import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { Features } from "@/sections/Features";
import { About } from "@/sections/About";
import { Footer } from "@/sections/Footer";
import { useAuth } from "@/utils/UseAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import HomeGuard from "@/utils/HomeGuard";

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  
  useEffect(() => {
    if (isAuthenticated === true) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="bg-black text-white">
      <HomeGuard>
        <Header />
        <Hero />
        <Features />
        <About />
        <Footer />
      </HomeGuard>
    </div>
  )
}