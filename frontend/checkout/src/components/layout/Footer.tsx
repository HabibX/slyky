import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-(--color-border) mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
        <p>© {new Date().getFullYear()} SLYKY · Built on Stellar</p>
        <div className="flex gap-4">
          <a href="https://github.com/HabibX/slyky" className="hover:text-(--color-text-primary)">GitHub</a>
          <a href="https://docs.slyky.app" className="hover:text-(--color-text-primary)">Docs</a>
          <Link to="/demo/checkout" className="hover:text-(--color-text-primary)">
            Demo
          </Link>
        </div>
      </div>
    </footer>
  );
}