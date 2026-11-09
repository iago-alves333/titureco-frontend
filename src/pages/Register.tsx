import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/services/api';
import { getErrorMessage } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter entre 2 e 100 caracteres')
    .max(100, 'O nome deve ter entre 2 e 100 caracteres'),
  email: z.email('Formato de e-mail inválido'),
  password: z
    .string()
    .min(6, 'A senha deve ter entre 6 e 50 caracteres')
    .max(50, 'A senha deve ter entre 6 e 50 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  usePageTitle('Criar Conta');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await api.post('/api/v1/auth/register', values);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar conta. Verifique os dados.'));
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
            Crie sua conta para explorar atrações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando…' : 'Criar Conta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary underline underline-offset-2">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
