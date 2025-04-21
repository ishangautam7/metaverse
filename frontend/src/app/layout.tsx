import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexRoom",
  description: "NexRoom is a vibrant 2D metaverse app where imagination meets interaction. Designed for creative expression and social connection, NexRoom lets users build and customize their own virtual rooms, explore unique spaces created by others, and hang out in real time with friends from around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative">
      <body className={(dmSans.className, "antialiased bg-[#EAEEFE]")}>
        {children}
      </body>
    </html>
  );
}
