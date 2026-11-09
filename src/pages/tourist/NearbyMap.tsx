import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';
import { buttonVariants } from '@/components/ui/button';
import {
  DEFAULT_CENTER,
  MarkerClusterGroup,
  TILE_ATTRIBUTION,
  TILE_URL,
} from '@/lib/leaflet';
import { cn, formatBRL, getErrorMessage } from '@/lib/utils';
import { useDebouncedValue, usePageTitle } from '@/lib/hooks';

const DEFAULT_ZOOM = 13;

function FlyTo({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, DEFAULT_ZOOM, { duration: 1.2 });
  }, [map, position]);
  return null;
}

export default function NearbyMap() {
  usePageTitle('Perto de Mim');
  const [userPos, setUserPos] = useState<[number, number]>(DEFAULT_CENTER);
  const [focusPos, setFocusPos] = useState<[number, number]>(DEFAULT_CENTER);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const debouncedRadiusKm = useDebouncedValue(radiusKm, 300);
  const [geoReady, setGeoReady] = useState(() => !navigator.geolocation);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setFocusPos(coords);
        setGeoReady(true);
      },
      () => {
        setGeoReady(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['attractions', 'nearby', userPos[0], userPos[1], debouncedRadiusKm],
    enabled: geoReady,
    queryFn: async () => {
      const res = await api.get<SpringPage<AttractionResponse>>('/api/v1/attractions/nearby', {
        params: {
          lat: userPos[0],
          lon: userPos[1],
          radiusKm: debouncedRadiusKm,
          size: 50,
        },
      });
      return res.data.content ?? [];
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error, 'Erro ao buscar atrações próximas.'));
    }
  }, [isError, error]);

  const attractions = (data ?? []).filter((a) => a.latitude != null && a.longitude != null);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-card border-b border-border">
        <h1 className="text-sm font-semibold">Atrações Próximas</h1>
        <label htmlFor="radius-slider" className="text-sm text-muted-foreground whitespace-nowrap">
          Raio: {radiusKm} km
        </label>
        <input
          id="radius-slider"
          type="range"
          min={1}
          max={100}
          value={radiusKm}
          aria-label="Raio de busca em quilômetros"
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="w-40 accent-primary"
        />
        <span className="text-sm text-muted-foreground">
          {isLoading
            ? 'Buscando…'
            : `${attractions.length} atração(ões) encontrada(s)`}
        </span>
      </div>

      {/* ── Split Sidebar + Map ──────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside
          aria-label="Lista de atrações no raio"
          className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card overflow-y-auto max-h-48 md:max-h-none p-3 space-y-2"
        >
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))
          ) : attractions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Nenhuma atração num raio de {debouncedRadiusKm} km.
            </p>
          ) : (
            attractions.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  setSelectedId(a.id);
                  setFocusPos([a.latitude, a.longitude]);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(a.id);
                    setFocusPos([a.latitude, a.longitude]);
                  }
                }}
                role="button"
                tabIndex={0}
                className={cn(
                  'rounded-lg border p-3 transition-colors cursor-pointer space-y-1',
                  selectedId === a.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:bg-muted/60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm line-clamp-1">{a.title}</p>
                  <span className="text-xs font-medium text-primary shrink-0">
                    {formatBRL(a.price)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{a.guideName}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    ★ {Number(a.ratingAverage || 0).toFixed(1)} · {a.availableSpots} vagas
                  </span>
                  <Link
                    to={`/attractions/${a.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))
          )}
        </aside>

        <div className="flex-1">
          {geoReady && (
            <MapContainer
              center={userPos}
              zoom={DEFAULT_ZOOM}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
              <FlyTo position={focusPos} />

              {/* User location & radius circle */}
              <Circle
                center={userPos}
                radius={debouncedRadiusKm * 1000}
                pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1.5 }}
              />
              <CircleMarker
                center={userPos}
                radius={8}
                pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }}
              >
                <Popup>Você está aqui</Popup>
              </CircleMarker>

              <MarkerClusterGroup>
                {attractions.map((a) => (
                  <Marker
                    key={a.id}
                    position={[a.latitude, a.longitude]}
                    eventHandlers={{
                      click: () => setSelectedId(a.id),
                    }}
                  >
                    <Popup>
                      <div className="space-y-1.5 min-w-[180px]">
                        <p className="font-semibold text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.guideName}</p>
                        <div className="flex justify-between text-xs">
                          <span>{formatBRL(a.price)}</span>
                          <span>★ {Number(a.ratingAverage || 0).toFixed(1)}</span>
                        </div>
                        <Link
                          to={`/attractions/${a.id}`}
                          className={cn(buttonVariants({ size: 'xs' }), 'w-full mt-1')}
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
