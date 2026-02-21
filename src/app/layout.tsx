import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stardream Goods Store",
  description: "MVP e-commerce web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-white shadow-sm">
          <Header />
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
