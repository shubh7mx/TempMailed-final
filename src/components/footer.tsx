
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/20 mt-12 py-8">
      <div className="container mx-auto px-4 text-center">
        <nav className="flex justify-center gap-4 sm:gap-6 mb-4">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Articles
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TempMailed. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
