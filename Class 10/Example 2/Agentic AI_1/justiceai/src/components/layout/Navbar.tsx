"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarUser {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface NavbarProps {
  user: NavbarUser;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <header className="fixed top-0 z-50 h-[60px] w-full border-b border-[#1E1E2E] bg-[#111118]">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="gradient-text text-lg font-bold">
          ⚖️ JusticeAI
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center rounded-full outline-none cursor-pointer">
            <Avatar className="h-8 w-8 border border-border">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-surface text-text-primary">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer hover:bg-surface-2">
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/legal")} className="cursor-pointer hover:bg-surface-2">
              ⚖️ Legal Analyzer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/code")} className="cursor-pointer hover:bg-surface-2">
              💻 Code Reviewer
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-danger hover:bg-danger/10 focus:text-danger"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
