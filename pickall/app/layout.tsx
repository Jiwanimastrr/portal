import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import Link from "next/link";
import Image from "next/image";
import { SettingsDialog } from "@/components/shared/SettingsDialog";


export const metadata: Metadata = {
  title: "모두의 뽑기 (PickAll)",
  description: "한국 초·중등 학원/교실에서 사용하는 4가지 뽑기 도구",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "모두의 뽑기",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased theme flex flex-col")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2.5">
                  <Image
                    src="/pickall/willgrow-logo.png"
                    alt="Willgrow Logo"
                    width={32}
                    height={32}
                    className="rounded-md"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">Willgrow Language Institute</span>
                    <span className="font-bold text-lg text-primary leading-tight">모두의 뽑기</span>
                  </div>
                </Link>
                <div className="flex items-center space-x-2">
                  <SettingsDialog />
                </div>
              </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
              {children}
            </main>
            
            <footer className="border-t py-6 bg-muted/20">
              <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
                <p>© 2026 PickAll. Built for classrooms.</p>
                <div className="flex items-center gap-4">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1" aria-label="GitHub Repository">
                    GitHub Repository
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }` }} />
      </body>
    </html>
  );
}
