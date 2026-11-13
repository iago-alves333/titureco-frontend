import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { UserResponse, SpringPage } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

export default function AdminUsers() {
  usePageTitle('Painel Admin · Usuários');
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: async () => {
      const res = await api.get<SpringPage<UserResponse>>('/api/v1/users', {
        params: { page, size: 15, sort: 'name,asc' },
      });
      return res.data;
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.patch(`/api/v1/users/${userId}/promote-guide`);
    },
    onSuccess: () => {
      toast.success('Usuário promovido a Guia com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao promover usuário.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/v1/users/${userId}`);
    },
    onSuccess: () => {
      toast.success('Usuário removido.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(
          err,
          'Não foi possível excluir o usuário. Verifique se há registros vinculados.',
        ),
      );
    },
  });

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administração de Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie contas da plataforma, promova turistas a guias e remova usuários sem vínculos
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          Nenhum usuário encontrado.
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {u.email || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {u.role === 'TOURIST' && (
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={promoteMutation.isPending}
                            onClick={() => promoteMutation.mutate(u.id)}
                          >
                            Promover a Guia
                          </Button>
                        )}
                        {!isSelf && u.role !== 'ADMIN' && (
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(u.id)}
                          >
                            Excluir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={Boolean(data?.last)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
