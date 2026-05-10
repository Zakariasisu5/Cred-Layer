import { createRootRouteWithContext, HeadContent, Outlet, Scripts, useRouter, useRouterState, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appCss from "../styles.css?url";
import { AppSidebar, MobileSidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { WalletProvider } from "@/lib/wallet";
import { Toaster } from "@/components/ui/sonner";

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-semibold text-gradient">404</h1>
        <p className="text-muted-foreground mt-2">Page not found</p>
        <Link to="/" className="inline-block mt-6 px-4 py-2 rounded-lg btn-primary btn-primary-hover text-sm">Go home</Link>
      </div>
    </div>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 px-4 py-2 rounded-lg btn-primary btn-primary-hover text-sm">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CredLayer — AI Trust Infrastructure for Web3" },
      { name: "description", content: "CredLayer is a decentralized reputation protocol on Solana — wallet trust scores, AI risk intelligence, and behavioral analytics for autonomous finance." },
      { property: "og:title", content: "CredLayer — AI Trust Infrastructure for Web3" },
      { name: "twitter:title", content: "CredLayer — AI Trust Infrastructure for Web3" },
      { property: "og:description", content: "CredLayer is a decentralized reputation protocol on Solana — wallet trust scores, AI risk intelligence, and behavioral analytics for autonomous finance." },
      { name: "twitter:description", content: "CredLayer is a decentralized reputation protocol on Solana — wallet trust scores, AI risk intelligence, and behavioral analytics for autonomous finance." },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: Shell,
  component: Root,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Root() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLanding = path === "/";
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {isLanding ? (
          <Outlet />
        ) : (
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar onMenuClick={() => setMobileOpen(true)} />
              <main className="flex-1 p-4 md:p-6"><Outlet /></main>
            </div>
          </div>
        )}
        <Toaster />
      </WalletProvider>
    </QueryClientProvider>
  );
}
