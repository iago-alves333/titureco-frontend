import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { UserResponse, UpdateProfileRequest } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getErrorMessage } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter entre 2 e 100 caracteres')
    .max(100, 'O nome deve ter entre 2 e 100 caracteres'),
  email: z.union([z.literal(''), z.email('Formato de e-mail inválido')]),
  password: z.union([
    z.literal(''),
    z
      .string()
      .min(6, 'A senha deve ter entre 6 e 50 caracteres')
      .max(50, 'A senha deve ter entre 6 e 50 caracteres'),
  ]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  usePageTitle('Meu Perfil');
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<UserResponse>('/api/v1/auth/me');
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: '', password: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, email: '', password: '' });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const payload: UpdateProfileRequest = {
        name: values.name.trim(),
      };
      if (values.email.trim()) payload.email = values.email.trim();
      if (values.password) payload.password = values.password;

      const { data } = await api.put<UserResponse>('/api/v1/auth/me', payload);
      return data;
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao atualizar perfil.'));
    },
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações pessoais e credenciais de acesso
          </p>
        </div>
        {profile && (
          <Badge variant="secondary" className="uppercase">
            {profile.role}
          </Badge>
        )}
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Dados da Conta</CardTitle>
          <CardDescription>
            {profile?.createdAt
              ? `Membro desde ${new Date(profile.createdAt).toLocaleDateString('pt-BR')}`
              : 'Atualize seu nome, e-mail ou senha'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((vals) => updateMutation.mutate(vals))}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Novo e-mail (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Deixe em branco para manter o atual"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Nova senha (opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Deixe em branco para manter a atual"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateMutation.isPending ? 'Salvando…' : 'Salvar Alterações'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
