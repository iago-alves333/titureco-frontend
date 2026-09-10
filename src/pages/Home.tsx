import { useEffect, useState, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default marker icon issue with bundlers
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

const DEFAULT_CENTER: [number, number] = [-7.12, -34.84]; // João Pessoa fallback
const DEFAULT_ZOOM = 13;

function FlyToLocation({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, DEFAULT_ZOOM, { duration: 1.5 });
  }, [map, position]);
  return null;
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [geoReady, setGeoReady] = useState(false);

  const fetchNearby = useCallback(async (lat: number, lon: number, radius: number, kw: string) => {
    try {
      const endpoint = kw.trim()
        ? `/api/v1/attractions/search`
        : `/api/v1/attractions/nearby`;

      const params: Record<string, string | number> = { lat, lon, radiusKm: radius, size: 50 };
      if (kw.trim()) params.keyword = kw.trim();

      const { data } = await api.get<AttractionResponse[] | SpringPage<AttractionResponse>>(endpoint, { params });
      setAttractions(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      // silently fail — map will be empty
    }
  }, []);

  // Get user geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoReady(true);
      fetchNearby(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radiusKm, '');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(coords);
        setGeoReady(true);
        fetchNearby(coords[0], coords[1], radiusKm, '');
      },
      () => {
        setGeoReady(true);
        fetchNearby(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radiusKm, '');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    fetchNearby(center[0], center[1], radiusKm, keyword);
  }

  return (
    <div className="relative h-screen w-full">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 py-3 bg-background/70 backdrop-blur-md border-b border-border/40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Titureco
        </h1>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Olá, {user.name}
              </span>
              {user.role === 'GUIDE' && (
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Entrar
            </Button>
          )}
        </nav>
      </header>

      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="absolute top-16 left-1/2 z-[1000] w-full max-w-xl -translate-x-1/2 px-4 pt-3">
        <div className="flex gap-2 rounded-xl border border-border/40 bg-card/80 p-3 backdrop-blur-md shadow-lg">
          <Input
            placeholder="Buscar atrações…"
            value={keyword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="radius" className="text-xs text-muted-foreground whitespace-nowrap">
              {radiusKm} km
            </label>
            <input
              id="radius"
              type="range"
              min={1}
              max={100}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>
          <Button onClick={handleSearch} size="sm">
            Buscar
          </Button>
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────────── */}
      {geoReady && (
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation position={center} />
          {attractions.filter(a => a.latitude != null && a.longitude != null).map((a) => (
            <Marker key={a.id} position={[a.latitude, a.longitude]}>
              <Popup>
                <div className="space-y-1 min-w-[180px]">
                  <p className="font-semibold text-sm">{a.title || 'Sem título'}</p>
                  <p className="text-xs text-gray-600">{a.guideName || 'Guia desconhecido'}</p>
                  <div className="flex justify-between text-xs">
                    <span>R$ {Number(a.price || 0).toFixed(2)}</span>
                    <span>⭐ {Number(a.ratingAverage || 0).toFixed(1)} ({a.reviewCount || 0})</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {a.availableSpots || 0} vagas disponíveis
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
