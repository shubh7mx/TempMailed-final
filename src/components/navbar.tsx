
"use client";
import Link from 'next/link';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

interface NavbarProps {
  onNewAddress: () => void;
}

export function Navbar({ onNewAddress }: NavbarProps) {
  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between gap-2 rounded-full border border-primary/10 bg-background/50 p-2 shadow-lg backdrop-blur-lg w-full max-w-2xl">
        <div className="flex-1 flex items-center gap-2">
          <Button onClick={onNewAddress} variant="default" className="rounded-full">
             <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">New Address</span>
              </span>
          </Button>
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="/" className="font-bold text-lg whitespace-nowrap flex items-center gap-2 group">
            <Logo />
            TempMailed
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
