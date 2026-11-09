import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { AttractionResponse } from '@/types/api';
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
  DEFAULT_CENTER,
  MarkerClusterGroup,
  TILE_ATTRIBUTION,
  TILE_URL,
} from '@/lib/leaflet';
import { formatBRL, getErrorMessage } from '@/lib/utils';
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

const INITIAL_VALUES: AttractionFormValues = {
  title: '',
  description: '',
  price: 0,
  availableSpots: 10,
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
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

export default function MapRegister() {
  usePageTitle('Mapa do Guia');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: attractions = [] } = useMyAttractions(
    user?.id,
    user?.role === 'ADMIN',
  );

  const [coords, setCoords] = useState<[number, number]>(DEFAULT_CENTER);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AttractionFormValues>({
    resolver: zodResolver(attractionSchema),
    defaultValues: INITIAL_VALUES,
  });

  function openNewDialog() {
    setEditingId(null);
    setCoords(DEFAULT_CENTER);
    reset(INITIAL_VALUES);
    setDialogOpen(true);
  }

  function openEditDialog(a: AttractionResponse) {
    setEditingId(a.id);
    setCoords([a.latitude, a.longitude]);
    reset({
      title: a.title,
      description: a.description ?? '',
      price: Number(a.price ?? 0),
      availableSpots: Number(a.availableSpots ?? 0),
      latitude: a.latitude,
      longitude: a.longitude,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: AttractionFormValues) => {
      if (editingId) {
        await api.put<AttractionResponse>(`/api/v1/attractions/${editingId}`, values);
      } else {
        await api.post<AttractionResponse>('/api/v1/attractions', values);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Atração atualizada!' : 'Atração cadastrada com sucesso!');
      setDialogOpen(false);
      setEditingId(null);
      reset(INITIAL_VALUES);
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Erro ao salvar atração. Verifique os campos.'));
    },
  });

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-card border-b border-border">
        <h1 className="text-sm font-semibold">Mapa de Atrações do Guia</h1>
        <span className="text-sm text-muted-foreground">
          {attractions.length} atração(ões) no mapa
        </span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" onClick={openNewDialog}>
                + Nova Atração
              </Button>
            }
          />
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Atração' : 'Cadastrar Atração'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit((vals) => saveMutation.mutate(vals))}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  maxLength={150}
                  aria-invalid={Boolean(errors.title)}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  maxLength={2000}
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
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
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
                  <Label htmlFor="spots">Vagas por dia</Label>
                  <Input
                    id="spots"
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

              <div className="space-y-2">
                <Label>Localização (clique no mapa abaixo)</Label>
                <p className="text-xs text-muted-foreground font-mono">
                  Lat: {coords[0].toFixed(5)} · Lng: {coords[1].toFixed(5)}
                </p>
                <div className="h-52 w-full rounded-md overflow-hidden border border-border">
                  <MapContainer
                    center={coords}
                    zoom={13}
                    className="h-full w-full"
                    zoomControl={false}
                  >
                    <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
                    <LocationPicker
                      position={coords}
                      onChange={(newLat, newLng) => {
                        setCoords([newLat, newLng]);
                        setValue('latitude', newLat, { shouldValidate: true });
                        setValue('longitude', newLng, { shouldValidate: true });
                      }}
                    />
                  </MapContainer>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Salvando…' : 'Salvar Atração'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Fullscreen Map ───────────────────────────────────── */}
      <div className="flex-1">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
          <MarkerClusterGroup>
            {attractions
              .filter((a) => a.latitude != null && a.longitude != null)
              .map((a) => (
                <Marker key={a.id} position={[a.latitude, a.longitude]}>
                  <Popup>
                    <div className="space-y-1.5 min-w-[160px]">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-xs">
                        {formatBRL(a.price)} · {a.availableSpots} vagas/dia
                      </p>
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        className="w-full"
                        onClick={() => openEditDialog(a)}
                      >
                        Editar
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
