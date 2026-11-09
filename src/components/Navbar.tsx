import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { toggleTheme, useIsDark } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface NavLinkItem {
  to: string;
  label: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDark = useIsDark();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: NavLinkItem[] = [
    { to: '/', label: 'Explorar' },
    { to: '/nearby', label: 'Perto de Mim' },
  ];

  if (user?.role === 'TOURIST' || user?.role === 'ADMIN') {
    links.push({ to: '/reservations', label: 'Minhas Reservas' });
  }
  if (user?.role === 'GUIDE' || user?.role === 'ADMIN') {
    links.push(
      { to: '/guide/dashboard', label: 'Dashboard' },
      { to: '/guide/map', label: 'Mapa do Guia' },
    );
  }
  if (user?.role === 'ADMIN') {
    links.push({ to: '/admin/users', label: 'Admin' });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="text-xl font-bold text-foreground select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
          >
            Titureco
          </Link>

          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  buttonVariants({
                    variant: location.pathname === l.to ? 'secondary' : 'ghost',
                    size: 'sm',
                  }),
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={cn(
                    buttonVariants({
                      variant: location.pathname === '/profile' ? 'secondary' : 'ghost',
                      size: 'sm',
                    }),
                  )}
                >
                  {user.name} · <span className="text-primary font-medium capitalize">{user.role.toLowerCase()}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                  Entrar
                </Link>
                <Link to="/register" className={cn(buttonVariants({ size: 'sm' }))}>
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Menu mobile"
          className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                buttonVariants({
                  variant: location.pathname === l.to ? 'secondary' : 'ghost',
                  size: 'sm',
                }),
                'w-full justify-start',
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-border flex flex-col gap-1">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({
                      variant: location.pathname === '/profile' ? 'secondary' : 'ghost',
                      size: 'sm',
                    }),
                    'w-full justify-start',
                  )}
                >
                  Perfil ({user.name} · {user.role.toLowerCase()})
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-start')}
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ size: 'sm' }), 'w-full justify-start')}
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
