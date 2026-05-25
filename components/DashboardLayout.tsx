import { Button } from "@/components/ui/button";
import { useSimpleAuth } from "@/useSimpleAuth";
import { BarChart3, Building2, FileText, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

const nav = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/customers", label: "Customers", icon: Building2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { logout } = useSimpleAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f2,#f4f6f5)] text-foreground dark:bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/70 bg-[#201915] text-white shadow-2xl transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <img src="/dada-logo.png" alt="Dada Restaurant" className="mb-4 h-14 w-auto rounded bg-white p-1" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Dada Restaurant</p>
            <h1 className="mt-1 text-2xl font-semibold">Invoice Ops</h1>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
                      active ? "bg-white text-[#201915]" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {open && <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-white/80 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">B2B billing workspace</p>
          </div>
          <Link href="/invoices/new">
            <Button size="sm">
              <FileText className="h-4 w-4" />
              New invoice
            </Button>
          </Link>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
