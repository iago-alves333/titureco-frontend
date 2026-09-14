import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const NAV_LINKS_TOURIST = [
  { to: '/', label: 'Explorar' },
  { to: '/nearby', label: '📍 Perto de Mim' },
] as const;

const NAV_LINKS_GUIDE = [
  { to: '/guide/dashboard', label: 'Dashboard' },
  { to: '/guide/map', label: '🗺️ Mapa' },
] as const;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = user?.role === 'GUIDE' || user?.role === 'ADMIN'
    ? [...NAV_LINKS_TOURIST, ...NAV_LINKS_GUIDE]
    : NAV_LINKS_TOURIST;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-background/70 backdrop-blur-md border-b border-border/40">
      <nav className="flex items-center gap-4">
        <span
          onClick={() => navigate('/')}
          className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer select-none"
        >
          Titureco
        </span>
        {links.map((l) => (
          <Button
            key={l.to}
            variant={location.pathname === l.to ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate(l.to)}
          >
            {l.label}
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name} · <span className="text-primary font-medium capitalize">{user.role.toLowerCase()}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Cadastrar</Button>
          </>
        )}
      </div>
    </header>
  );
}
