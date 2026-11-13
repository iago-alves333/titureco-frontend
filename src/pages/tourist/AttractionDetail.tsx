import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type {
  AttractionResponse,
  ReviewResponse,
  ReservationResponse,
  SpringPage,
  ReservationRequest,
} from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import attractionImages from '@/data/attraction-images.json';
import { TILE_ATTRIBUTION, TILE_URL } from '@/lib/leaflet';
import { formatBRL, getErrorMessage } from '@/lib/utils';
import { usePageTitle } from '@/lib/hooks';

export default function AttractionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reserveDate, setReserveDate] = useState('');
  const [reserveHour, setReserveHour] = useState('09:00');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: attraction, isLoading } = useQuery({
    queryKey: ['attraction', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<AttractionResponse>(`/api/v1/attractions/${id}`);
      return data;
    },
  });

  usePageTitle(attraction?.title ?? 'Detalhes da Atração');

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', 'attraction', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ReviewResponse>>(
        `/api/v1/reviews/attraction/${id}`,
        { params: { size: 50 } },
      );
      return data.content ?? [];
    },
  });

  // Fetch tourist's reservations to check if they completed a visit to this attraction
  const { data: myReservations = [] } = useQuery({
    queryKey: ['reservations', 'mine', user?.id],
    enabled: user?.role === 'TOURIST',
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ReservationResponse>>('/api/v1/reservations', {
        params: { size: 100 },
      });
      return data.content ?? [];
    },
  });

  const myReview = user ? reviews.find((r) => r.touristId === user.id) : undefined;
  const hasCompletedReservation = myReservations.some(
    (r) => r.attractionId === id && r.status === 'COMPLETED',
  );

  const reserveMutation = useMutation({
    mutationFn: async () => {
      if (!id || !reserveDate) return;
      const body: ReservationRequest = {
        attractionId: id,
        reservedFor: `${reserveDate}T${reserveHour}:00`,
      };
      await api.post('/api/v1/reservations', body);
    },
    onSuccess: () => {
      toast.success('Reserva criada com sucesso!');
      setReserveDate('');
      setReserveHour('09:00');
      queryClient.invalidateQueries({ queryKey: ['reservations', 'mine', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['attraction', id] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao reservar. Verifique a data ou tente novamente.'));
    },
  });

  const saveReviewMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const payload = { attractionId: id, rating, comment: comment.trim() || undefined };
      if (editingReviewId) {
        await api.put(`/api/v1/reviews/${editingReviewId}`, payload);
      } else {
        await api.post('/api/v1/reviews', payload);
      }
    },
    onSuccess: () => {
      toast.success(editingReviewId ? 'Avaliação atualizada!' : 'Avaliação enviada!');
      setEditingReviewId(null);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', 'attraction', id] });
      queryClient.invalidateQueries({ queryKey: ['attraction', id] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao salvar avaliação.'));
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/api/v1/reviews/${reviewId}`);
    },
    onSuccess: () => {
      toast.success('Avaliação excluída.');
      setEditingReviewId(null);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', 'attraction', id] });
      queryClient.invalidateQueries({ queryKey: ['attraction', id] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao excluir avaliação.'));
    },
  });

  function handleReserve(e: FormEvent) {
    e.preventDefault();
    reserveMutation.mutate();
  }

  function handleReview(e: FormEvent) {
    e.preventDefault();
    saveReviewMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 md:h-80 rounded-xl bg-muted" />
          <div className="space-y-4">
            <div className="h-7 w-2/3 rounded bg-muted" />
            <div className="h-16 rounded bg-muted" />
            <div className="h-6 w-1/2 rounded bg-muted" />
            <div className="h-40 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="text-center py-28 space-y-3">
        <p className="text-muted-foreground">Atração não encontrada.</p>
        <Link to="/" className="text-sm text-primary underline">
          Voltar para Explorar
        </Link>
      </div>
    );
  }

  const a = attraction;
  const imageUrl =
    (attractionImages as Record<string, string>)[a.id] ||
    `https://picsum.photos/seed/${a.id}/600/400`;
  const tomorrowIso = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <img
          src={imageUrl}
          alt={a.title}
          className="w-full h-64 md:h-80 object-cover rounded-xl"
        />
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{a.title}</h1>
          <p className="text-muted-foreground">{a.description || 'Sem descrição.'}</p>
          <div className="flex flex-wrap gap-4 text-sm items-center">
            <span className="font-semibold text-primary text-lg">{formatBRL(a.price)}</span>
            <span aria-label={`Nota média ${Number(a.ratingAverage || 0).toFixed(1)} de 5`}>
              ★ {Number(a.ratingAverage || 0).toFixed(1)} ({a.reviewCount || 0} avaliações)
            </span>
            <span>{a.availableSpots || 0} vagas/dia</span>
          </div>
          <p className="text-xs text-muted-foreground">Guia: {a.guideName}</p>

          <div className="h-40 rounded-lg overflow-hidden border border-border">
            <MapContainer
              center={[a.latitude, a.longitude]}
              zoom={14}
              className="h-full w-full"
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
            >
              <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
              <Marker position={[a.latitude, a.longitude]} />
            </MapContainer>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Reserve (TOURIST only) ─────────────────────────── */}
      {user?.role === 'TOURIST' && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Reservar esta atração</h2>
          <form onSubmit={handleReserve} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="reserveDate">Data</Label>
              <Input
                id="reserveDate"
                type="date"
                min={tomorrowIso}
                value={reserveDate}
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker();
                  } catch {
                    // ignore on browsers without showPicker
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setReserveDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reserveHour">Horário</Label>
              <select
                id="reserveHour"
                value={reserveHour}
                onChange={(e) => setReserveHour(e.target.value)}
                className="flex h-8 w-28 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const h = i.toString().padStart(2, '0');
                  return (
                    <option key={h} value={`${h}:00`}>
                      {h}:00
                    </option>
                  );
                })}
              </select>
            </div>
            <Button type="submit" disabled={reserveMutation.isPending}>
              {reserveMutation.isPending ? 'Reservando…' : 'Reservar'}
            </Button>
          </form>
        </section>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="text-primary underline">
            Faça login
          </Link>{' '}
          como turista para reservar e avaliar esta atração.
        </p>
      )}

      <Separator />

      {/* ── Reviews ────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Avaliações</h2>

        {user?.role === 'TOURIST' && !hasCompletedReservation && !myReview && (
          <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2">
            As avaliações ficam disponíveis após você realizar e concluir uma reserva nesta atração.
          </p>
        )}

        {user?.role === 'TOURIST' && (hasCompletedReservation || editingReviewId) && (!myReview || editingReviewId) && (
          <form
            onSubmit={handleReview}
            className="space-y-3 p-4 rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Label>Nota:</Label>
              <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} de 5 estrelas`}
                    aria-pressed={n === rating}
                    onClick={() => setRating(n)}
                    className={`text-xl transition-colors cursor-pointer ${
                      n <= rating ? 'text-amber-500' : 'text-muted-foreground/30'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              aria-label="Comentário da avaliação"
              placeholder="Deixe um comentário (opcional, máx. 500 caracteres)"
              value={comment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              maxLength={500}
              rows={2}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saveReviewMutation.isPending}>
                {saveReviewMutation.isPending
                  ? 'Salvando…'
                  : editingReviewId
                    ? 'Salvar Alterações'
                    : 'Enviar Avaliação'}
              </Button>
              {editingReviewId && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingReviewId(null)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda sem avaliações.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const isMine = user?.id === r.touristId;
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-lg border border-border bg-muted/40 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{r.touristName}</span>
                    <span
                      className="text-amber-500 text-sm"
                      aria-label={`${r.rating} de 5 estrelas`}
                    >
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    {isMine && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setEditingReviewId(r.id);
                            setRating(r.rating);
                            setComment(r.comment ?? '');
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="destructive"
                          disabled={deleteReviewMutation.isPending}
                          onClick={() => deleteReviewMutation.mutate(r.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
