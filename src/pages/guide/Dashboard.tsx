import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type {
  AttractionResponse,
  ReservationResponse,
  SpringPage,
  Status,
} from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AttractionCard, { AttractionCardSkeleton } from '@/components/AttractionCard';
import { cn, getErrorMessage } from '@/lib/utils';
import { useMyAttractions, usePageTitle } from '@/lib/hooks';

const attractionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório')
    .max(150, 'O título não pode ter mais de 150 caracteres'),
  description: z
    .string()
    .max(2000, 'A descrição não pode ter mais de 2000 caracteres'),
  price: z.number().min(0, 'O preço não pode ser negativo'),
  availableSpots: z.number().int().min(0, 'A quantidade de vagas não pode ser negativa'),
  latitude: z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida'),
  longitude: z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida'),
});

type AttractionFormValues = z.infer<typeof attractionSchema>;

const STATUS_META: { status: Status; label: string; barClass: string }[] = [
  { status: 'PENDING', label: 'Pendentes', barClass: 'bg-amber-500' },
  { status: 'CONFIRMED', label: 'Confirmadas', barClass: 'bg-emerald-500' },
  { status: 'COMPLETED', label: 'Concluídas', barClass: 'bg-blue-500' },
  { status: 'CANCELLED', label: 'Canceladas', barClass: 'bg-red-500' },
];

export default function GuideDashboard() {
  usePageTitle('Dashboard do Guia');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AttractionResponse | null>(null);

  const { data: attractions = [], isLoading } = useMyAttractions(
    user?.id,
    user?.role === 'ADMIN',
  );

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations', 'guide', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ReservationResponse>>(
        '/api/v1/reservations/guide',
        { params: { size: 200 } },
      );
      return data.content ?? [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttractionFormValues>({
    resolver: zodResolver(attractionSchema),
  });

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        description: editing.description ?? '',
        price: Number(editing.price ?? 0),
        availableSpots: Number(editing.availableSpots ?? 0),
        latitude: editing.latitude,
        longitude: editing.longitude,
      });
    }
  }, [editing, reset]);

  const updateMutation = useMutation({
    mutationFn: async (values: AttractionFormValues) => {
      if (!editing) return;
      await api.put(`/api/v1/attractions/${editing.id}`, values);
    },
    onSuccess: () => {
      toast.success('Atração atualizada com sucesso!');
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao atualizar atração.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/attractions/${id}`);
    },
    onSuccess: () => {
      toast.success('Atração excluída.');
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao excluir atração.'));
    },
  });

  const totalAttractions = attractions.length;
  const totalReservations = reservations.length;
  const activeOrDone = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'COMPLETED',
  ).length;
  const avgRating =
    totalAttractions > 0
      ? (
          attractions.reduce((acc, a) => acc + Number(a.ratingAverage || 0), 0) /
          totalAttractions
        ).toFixed(1)
      : '0.0';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Guia</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe métricas, reservas e gerencie suas atrações cadastradas
          </p>
        </div>
        <Link to="/guide/map" className={cn(buttonVariants({ size: 'default' }))}>
          + Cadastrar no Mapa
        </Link>
      </div>

      {/* ── Metrics + Status Breakdown ───────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Atrações Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAttractions}</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalReservations}</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Confirmadas / Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeOrDone}</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Nota Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">★ {avgRating}</p>
          </CardContent>
        </Card>
      </div>

      {totalReservations > 0 && (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Reservas por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label="Distribuição de reservas por status"
            >
              {STATUS_META.map(({ status, barClass }) => {
                const count = reservations.filter((r) => r.status === status).length;
                if (count === 0) return null;
                const pct = (count / totalReservations) * 100;
                return (
                  <div
                    key={status}
                    style={{ width: `${pct}%` }}
                    className={barClass}
                    title={`${status}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {STATUS_META.map(({ status, label, barClass }) => {
                const count = reservations.filter((r) => r.status === status).length;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-full shrink-0', barClass)} />
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Attractions Grid ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Minhas Atrações</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <AttractionCardSkeleton key={i} />
            ))}
          </div>
        ) : attractions.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Nenhuma atração cadastrada ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a) => (
              <div key={a.id} className="relative">
                <AttractionCard attraction={a} />
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Link
                    to={`/guide/attractions/${a.id}/participants`}
                    className={cn(buttonVariants({ size: 'xs', variant: 'secondary' }))}
                  >
                    Participantes
                  </Link>
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    onClick={() => setEditing(a)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="destructive"
                    aria-label={`Excluir ${a.title}`}
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(a.id)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Atração</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((vals) => updateMutation.mutate(vals))}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min={0}
                  aria-invalid={Boolean(errors.price)}
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-spots">Vagas por dia</Label>
                <Input
                  id="edit-spots"
                  type="number"
                  min={0}
                  aria-invalid={Boolean(errors.availableSpots)}
                  {...register('availableSpots', { valueAsNumber: true })}
                />
                {errors.availableSpots && (
                  <p className="text-xs text-destructive">{errors.availableSpots.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-lat">Latitude</Label>
                <Input
                  id="edit-lat"
                  type="number"
                  step="any"
                  aria-invalid={Boolean(errors.latitude)}
                  {...register('latitude', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lng">Longitude</Label>
                <Input
                  id="edit-lng"
                  type="number"
                  step="any"
                  aria-invalid={Boolean(errors.longitude)}
                  {...register('longitude', { valueAsNumber: true })}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando…' : 'Salvar Alterações'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
