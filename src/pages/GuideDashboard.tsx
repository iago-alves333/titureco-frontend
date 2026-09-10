import { useEffect, useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/services/api';
import type { AttractionResponse, AttractionRequest, SpringPage } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';

// Leaflet icon fix (same as Home)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const INITIAL_FORM: AttractionRequest = {
  title: '',
  description: '',
  price: 0,
  availableSpots: 1,
  latitude: -7.12,
  longitude: -34.84,
};

function LocationPicker({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={position} />;
}

export default function GuideDashboard() {
  const { user, logout } = useAuth();
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AttractionRequest>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMyAttractions = useCallback(async () => {
    try {
      // ponytail: API doesn't have a /my-attractions endpoint; fetch all paginated and filter client-side.
      // Ceiling: breaks past ~1000 attractions per guide. Upgrade: add backend filter by guideId.
      const { data } = await api.get<AttractionResponse[] | SpringPage<AttractionResponse>>('/api/v1/attractions', {
        params: { size: 200 },
      });
      const list = Array.isArray(data) ? data : data.content ?? [];
      setAttractions(list.filter((a) => a.guideId === user?.id));
    } catch {
      // leave empty
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyAttractions();
  }, [fetchMyAttractions]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post<AttractionResponse>('/api/v1/attractions', form);
      setForm(INITIAL_FORM);
      setDialogOpen(false);
      fetchMyAttractions();
    } catch {
      setError('Erro ao criar atração. Verifique os campos.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta atração?')) return;
    try {
      await api.delete(`/api/v1/attractions/${id}`);
      setAttractions((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Erro ao excluir atração.');
    }
  }

  return (
    <div className="min-h-screen">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-background/70 backdrop-blur-md border-b border-border/40">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          Titureco
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user?.name} · <span className="text-primary font-medium">Guia</span>
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* ── Header + New button ─────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Minhas Atrações</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button>+ Nova Atração</Button>} />
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Atração</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    maxLength={150}
                    value={form.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    maxLength={2000}
                    rows={3}
                    value={form.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.price}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spots">Vagas</Label>
                    <Input
                      id="spots"
                      type="number"
                      min={0}
                      value={form.availableSpots}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, availableSpots: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {/* ── Mini-mapa clicável ──────────────────────── */}
                <div className="space-y-2">
                  <Label>Localização (clique no mapa)</Label>
                  <p className="text-xs text-muted-foreground">
                    Lat: {form.latitude.toFixed(5)} · Lng: {form.longitude.toFixed(5)}
                  </p>
                  <div className="h-52 w-full rounded-md overflow-hidden border border-border">
                    <MapContainer
                      center={[form.latitude, form.longitude]}
                      zoom={13}
                      className="h-full w-full"
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        position={[form.latitude, form.longitude]}
                        onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
                      />
                    </MapContainer>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Salvando…' : 'Salvar Atração'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Tabela de atrações ──────────────────────────────── */}
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden sm:table-cell">Preço</TableHead>
                <TableHead className="hidden sm:table-cell">Vagas</TableHead>
                <TableHead className="hidden md:table-cell">Avaliação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attractions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    Nenhuma atração cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                attractions.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title || 'Sem título'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      R$ {Number(a.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{a.availableSpots || 0}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      ⭐ {Number(a.ratingAverage || 0).toFixed(1)} ({a.reviewCount || 0})
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
