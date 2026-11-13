import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { ReservationResponse, SpringPage, Status } from '@/types/api';
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
import { useAuth } from '@/contexts/AuthContext';

const STATUS_LABELS: Record<Status, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS: Record<Status, string> = {
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  COMPLETED: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  CANCELLED: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
};

export default function MyReservations() {
  usePageTitle('Minhas Reservas');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | Status>('ALL');

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', 'mine', user?.id],
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ReservationResponse>>('/api/v1/reservations', {
        params: { size: 100 },
      });
      return data.content ?? [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/v1/reservations/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success('Reserva cancelada com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine', user?.id] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Não foi possível cancelar a reserva.'));
    },
  });

  const filtered =
    filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Minhas Reservas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o status dos seus passeios e gerencie suas reservas
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por status">
          {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <Button
              key={st}
              size="xs"
              variant={filter === st ? 'default' : 'outline'}
              onClick={() => setFilter(st)}
            >
              {st === 'ALL' ? 'Todas' : STATUS_LABELS[st]}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
          <Link to="/" className="text-sm text-primary underline">
            Explorar atrações disponíveis
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atração</TableHead>
                <TableHead>Data Reservada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/attractions/${r.attractionId}`}
                      className="hover:underline text-primary"
                    >
                      {r.attractionTitle || 'Ver atração'}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(r.reservedFor).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[r.status] || ''}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                      <Button
                        size="xs"
                        variant="destructive"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(r.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                    {r.status === 'COMPLETED' && (
                      <Link
                        to={`/attractions/${r.attractionId}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Avaliar passeio
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
