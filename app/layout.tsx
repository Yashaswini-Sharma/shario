import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { WebSocketProvider } from "@/lib/websocket-context";
import { CommunityProvider } from "@/lib/community-context";
import { FloatingShareButton } from "@/components/floating-share-button";
import { CommunityMembers } from "@/components/community-members";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Share.io - Fashion Community",
  description: "Join fashion communities and share your style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CommunityProvider>
            <WebSocketProvider>
              {children}
              <FloatingShareButton />
              <CommunityMembers />
            </WebSocketProvider>
          </CommunityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
