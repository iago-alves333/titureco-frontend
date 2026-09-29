import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';
import { Button } from '@/components/ui/button';

import { useNavigate } from 'react-router-dom';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const DEFAULT_CENTER: [number, number] = [-7.12, -34.84];
const DEFAULT_ZOOM = 13;

function FlyTo({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, DEFAULT_ZOOM, { duration: 1.5 }); }, [map, position]);
  return null;
}

export default function NearbyMap() {
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(10);
  const [geoReady, setGeoReady] = useState(false);

  const fetchNearby = useCallback(async (lat: number, lon: number, radius: number) => {
    try {
      const { data } = await api.get<SpringPage<AttractionResponse>>('/api/v1/attractions/nearby', {
        params: { lat, lon, radiusKm: radius, size: 50 },
      });
      setAttractions(data.content ?? []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoReady(true);
      fetchNearby(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radiusKm);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(coords);
        setGeoReady(true);
        fetchNearby(coords[0], coords[1], radiusKm);
      },
      () => {
        setGeoReady(true);
        fetchNearby(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radiusKm);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRadiusChange(r: number) {
    setRadiusKm(r);
    fetchNearby(center[0], center[1], r);
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card border-b border-border">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          Raio: {radiusKm} km
        </label>
        <input
          type="range" min={1} max={100} value={radiusKm}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-40 accent-primary"
        />
        <span className="text-sm text-muted-foreground">
          {attractions.length} atração(ões) encontrada(s)
        </span>
      </div>

      {/* ── Map ──────────────────────────────────────────────── */}
      <div className="flex-1">
        {geoReady && (
          <MapContainer center={center} zoom={DEFAULT_ZOOM} className="h-full w-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo position={center} />
            {attractions.filter(a => a.latitude != null && a.longitude != null).map((a) => (
              <Marker key={a.id} position={[a.latitude, a.longitude]}>
                <Popup>
                  <div className="space-y-1 min-w-[180px]">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.guideName}</p>
                    <div className="flex justify-between text-xs">
                      <span>R$ {Number(a.price || 0).toFixed(2)}</span>
                      <span>⭐ {Number(a.ratingAverage || 0).toFixed(1)}</span>
                    </div>
                    <Button size="xs" className="w-full mt-1" onClick={() => navigate(`/attractions/${a.id}`)}>
                      Ver Detalhes
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
