import { useEffect, useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/services/api';
import type { AttractionResponse, AttractionRequest, SpringPage } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const DEFAULT_CENTER: [number, number] = [-7.12, -34.84];
const INITIAL_FORM: AttractionRequest = {
  title: '', description: '', price: 0, availableSpots: 10, latitude: DEFAULT_CENTER[0], longitude: DEFAULT_CENTER[1],
};

function LocationPicker({ position, onChange }: { position: [number, number]; onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onChange(e.latlng.lat, e.latlng.lng); },
  });
  return <Marker position={position} />;
}

export default function MapRegister() {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AttractionRequest>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMyAttractions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get<SpringPage<AttractionResponse>>('/api/v1/attractions', { params: { size: 200 } });
      const list = data.content ?? [];
      setAttractions(list.filter((a) => a.guideId === user.id));
    } catch {
      // leave empty
    }
  }, [user?.id]);

  useEffect(() => { fetchMyAttractions(); }, [fetchMyAttractions]);

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

  function onField(field: keyof AttractionRequest) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: field === 'title' || field === 'description' ? val : Number(val),
      }));
    };
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card border-b border-border">
        <span className="text-sm text-muted-foreground">
          {attractions.length} atração(ões) no mapa
        </span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm">+ Nova Atração</Button>} />
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Atração</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" maxLength={150} value={form.title} onChange={onField('title')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" maxLength={2000} rows={3} value={form.description} onChange={onField('description')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input id="price" type="number" step="0.01" min={0} value={form.price} onChange={onField('price')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spots">Vagas</Label>
                  <Input id="spots" type="number" min={0} value={form.availableSpots} onChange={onField('availableSpots')} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localização (clique no mapa abaixo)</Label>
                <p className="text-xs text-muted-foreground font-mono">
                  Lat: {form.latitude.toFixed(5)} · Lng: {form.longitude.toFixed(5)}
                </p>
                <div className="h-52 w-full rounded-md overflow-hidden border border-border">
                  <MapContainer center={[form.latitude, form.longitude]} zoom={13} className="h-full w-full" zoomControl={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker
                      position={[form.latitude, form.longitude]}
                      onChange={(lat, lng) => setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
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

      {/* ── Fullscreen Map ───────────────────────────────────── */}
      <div className="flex-1">
        <MapContainer center={DEFAULT_CENTER} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {attractions.filter(a => a.latitude != null && a.longitude != null).map((a) => (
            <Marker key={a.id} position={[a.latitude, a.longitude]}>
              <Popup>
                <div className="space-y-1 min-w-[160px]">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs">R$ {Number(a.price || 0).toFixed(2)} · {a.availableSpots} vagas</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
