import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type {
  ReservationResponse,
  AttractionResponse,
  SpringPage,
  Status,
} from '@/types/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, getErrorMessage } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

const STATUS_LABELS: Record<Status, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  COMPLETED: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  CANCELLED: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
};

export default function Participants() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: attraction } = useQuery({
    queryKey: ['attraction', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<AttractionResponse>(`/api/v1/attractions/${id}`);
      return data;
    },
  });

  usePageTitle(
    attraction ? `Participantes · ${attraction.title}` : 'Participantes da Atração',
  );

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', 'attraction', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ReservationResponse>>(
        `/api/v1/reservations/guide/attractions/${id}`,
        { params: { size: 100 } },
      );
      return data.content ?? [];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      resId,
      action,
    }: {
      resId: string;
      action: 'confirm' | 'complete';
    }) => {
      await api.patch(`/api/v1/reservations/${resId}/${action}`);
      return action;
    },
    onSuccess: (action) => {
      toast.success(
        action === 'confirm' ? 'Reserva confirmada!' : 'Reserva marcada como concluída!',
      );
      queryClient.invalidateQueries({ queryKey: ['reservations', 'attraction', id] });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'guide'] });
    },
    onError: (err, { action }) => {
      toast.error(
        getErrorMessage(
          err,
          `Erro ao ${action === 'confirm' ? 'confirmar' : 'concluir'} reserva.`,
        ),
      );
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/guide/dashboard"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-4')}
      >
        ← Voltar ao Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-1">
        {attraction?.title || 'Atração'}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Gestão de participantes e reservas
      </p>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          Nenhuma reserva para esta atração.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turista</TableHead>
                <TableHead>Data Reservada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.touristName || r.touristId}
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
                  <TableCell className="text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <Button
                        size="xs"
                        disabled={actionMutation.isPending}
                        onClick={() =>
                          actionMutation.mutate({ resId: r.id, action: 'confirm' })
                        }
                      >
                        Confirmar
                      </Button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={actionMutation.isPending}
                        onClick={() =>
                          actionMutation.mutate({ resId: r.id, action: 'complete' })
                        }
                      >
                        Concluir
                      </Button>
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
