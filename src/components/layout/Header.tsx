import Link from "next/link";
import { BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold">
          <BookOpen className="size-5 text-primary" aria-hidden="true" />
          <span>Review Dude</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
            Decks
          </Button>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/stats" />}>
            <BarChart3 className="size-4" aria-hidden="true" />
            Stats
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
