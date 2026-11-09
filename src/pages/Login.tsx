import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getErrorMessage } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  usePageTitle('Entrar');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const data = await login(values.email, values.password);
      toast.success(`Bem-vindo(a), ${data.name}!`);
      const fallback =
        data.role === 'ADMIN'
          ? '/admin/users'
          : data.role === 'GUIDE'
            ? '/guide/dashboard'
            : '/';
      navigate(from || fallback, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Credenciais inválidas. Tente novamente.'));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-border bg-card shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            <Link to="/">Titureco</Link>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link to="/register" className="text-primary underline underline-offset-2">
                Cadastrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
