import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="SLYKY" className="w-7 h-7" />
          <span className="font-bold text-[var(--color-text-primary)] tracking-tight">SLYKY</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Dashboard
          </Link>
          <Link to="/register" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}