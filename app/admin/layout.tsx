"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { clearSupabaseSession } from "@/lib/supabase-client";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/hero", label: "Hero Manager", icon: ImageIcon },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-[220px] border-r bg-white p-4">
      <p className="mb-6 font-serif text-3xl">DALA</p>
      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 text-sm ${active ? "bg-black text-white" : "hover:bg-zinc-100"}`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.14em] hover:bg-zinc-100"
        onClick={async () => {
          await clearSupabaseSession();
          await signOut({ callbackUrl: "/admin/login" });
        }}
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b p-3 md:hidden">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
          <Menu size={18} />
          Menu
        </button>
      </div>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={() => setOpen(false)}>
          <div className="h-full bg-white" onClick={(e) => e.stopPropagation()}>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
