import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

export default function NotFound() {
  usePageTitle('Página não encontrada');

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-28 text-center">
      <p className="text-5xl font-extrabold text-primary mb-2">404</p>
      <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground mb-6">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link to="/" className={cn(buttonVariants({ size: 'default' }))}>
        Voltar para o início
      </Link>
    </div>
  );
}
