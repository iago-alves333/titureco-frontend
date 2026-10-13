import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/services/api';
import type { AttractionResponse, ReviewResponse, SpringPage, ReservationRequest } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import attractionImages from '@/data/attraction-images.json';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

export default function AttractionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Reservation form
  const [reserveDate, setReserveDate] = useState('');
  const [reserveHour, setReserveHour] = useState('09:00');
  const [reserveMsg, setReserveMsg] = useState('');
  const [reserving, setReserving] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      api.get<AttractionResponse>(`/api/v1/attractions/${id}`),
      api.get<SpringPage<ReviewResponse>>(`/api/v1/reviews/attraction/${id}`, { params: { size: 50 } }),
    ])
      .then(([attrRes, revRes]) => {
        setAttraction(attrRes.data);
        setReviews(revRes.data.content ?? []);
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReserve(e: FormEvent) {
    e.preventDefault();
    if (!id || !reserveDate) return;
    setReserving(true);
    setReserveMsg('');
    try {
      const body: ReservationRequest = {
        attractionId: id,
        reservedFor: `${reserveDate}T${reserveHour}:00`,
      };
      await api.post('/api/v1/reservations', body);
      setReserveMsg('✅ Reserva criada com sucesso!');
      setReserveDate('');
      setReserveHour('09:00');
    } catch {
      setReserveMsg('❌ Erro ao reservar. Verifique a data ou tente novamente.');
    } finally {
      setReserving(false);
    }
  }

  async function handleReview(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setReviewing(true);
    setReviewMsg('');
    try {
      await api.post('/api/v1/reviews', { attractionId: id, rating, comment: comment || undefined });
      setReviewMsg('✅ Avaliação enviada!');
      setComment('');
      // Refresh reviews
      const { data } = await api.get<SpringPage<ReviewResponse>>(`/api/v1/reviews/attraction/${id}`, { params: { size: 50 } });
      setReviews(data.content ?? []);
    } catch {
      setReviewMsg('❌ Erro ao enviar avaliação.');
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      </>
    );
  }

  if (!attraction) {
    return (
      <>
        <p className="text-center text-muted-foreground py-32">Atração não encontrada.</p>
      </>
    );
  }

  const a = attraction;
  const imageUrl = (attractionImages as Record<string, string>)[a.id] || `https://picsum.photos/seed/${a.id}/600/400`;

  return (
    <>
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
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold text-primary text-lg">R$ {Number(a.price || 0).toFixed(2)}</span>
              <span>⭐ {Number(a.ratingAverage || 0).toFixed(1)} ({a.reviewCount || 0} avaliações)</span>
              <span>🎫 {a.availableSpots || 0} vagas</span>
            </div>
            <p className="text-xs text-muted-foreground">Guia: {a.guideName}</p>

            {/* Mini map */}
            <div className="h-40 rounded-lg overflow-hidden border border-border">
              <MapContainer
                center={[a.latitude, a.longitude]}
                zoom={14}
                className="h-full w-full"
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                  value={reserveDate}
                  onClick={(e) => {
                    try { (e.target as HTMLInputElement).showPicker(); } catch {}
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setReserveDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reserveHour">Hora</Label>
                <select
                  id="reserveHour"
                  value={reserveHour}
                  onChange={(e) => setReserveHour(e.target.value)}
                  className="flex h-8 w-24 rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const h = i.toString().padStart(2, '0');
                    return <option key={h} value={`${h}:00`}>{h}:00</option>;
                  })}
                </select>
              </div>
              <Button type="submit" disabled={reserving}>
                {reserving ? 'Reservando…' : 'Reservar'}
              </Button>
            </form>
            {reserveMsg && <p className="text-sm">{reserveMsg}</p>}
          </section>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground italic">Faça login como turista para reservar e avaliar.</p>
        )}

        <Separator />

        {/* ── Reviews ────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Avaliações</h2>

          {/* Review form (TOURIST only) */}
          {user?.role === 'TOURIST' && (
            <form onSubmit={handleReview} className="space-y-3 p-4 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <Label>Nota:</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-xl transition-colors ${n <= rating ? 'text-amber-500' : 'text-muted-foreground/30'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Deixe um comentário (opcional)"
                value={comment}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                maxLength={500}
                rows={2}
              />
              <Button type="submit" size="sm" disabled={reviewing}>
                {reviewing ? 'Enviando…' : 'Enviar Avaliação'}
              </Button>
              {reviewMsg && <p className="text-sm">{reviewMsg}</p>}
            </form>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda sem avaliações.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-border bg-muted/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{r.touristName}</span>
                    <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground/60">
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
