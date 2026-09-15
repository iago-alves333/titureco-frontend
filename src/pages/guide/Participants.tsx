import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { ReservationResponse, AttractionResponse, SpringPage } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/components/Navbar';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function Participants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [attrRes, resRes] = await Promise.all([
        api.get<AttractionResponse>(`/api/v1/attractions/${id}`),
        api.get<SpringPage<ReservationResponse>>(`/api/v1/reservations/guide/attractions/${id}`, { params: { size: 100 } }),
      ]);
      setAttraction(attrRes.data);
      setReservations(resRes.data.content ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(resId: string, action: 'confirm' | 'complete') {
    try {
      await api.patch(`/api/v1/reservations/${resId}/${action}`);
      fetchData();
    } catch {
      alert(`Erro ao ${action === 'confirm' ? 'confirmar' : 'completar'} reserva.`);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/guide/dashboard')} className="mb-4">
          ← Voltar
        </Button>

        <h2 className="text-2xl font-bold mb-1">
          {attraction?.title || 'Atração'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Gestão de participantes e reservas
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : reservations.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhuma reserva para esta atração.</p>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
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
                    <TableCell className="font-medium">{r.touristName || r.touristId}</TableCell>
                    <TableCell>
                      {new Date(r.reservedFor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[r.status] || ''}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <Button size="xs" onClick={() => handleAction(r.id, 'confirm')}>
                          Confirmar
                        </Button>
                      )}
                      {r.status === 'CONFIRMED' && (
                        <Button size="xs" variant="secondary" onClick={() => handleAction(r.id, 'complete')}>
                          Completar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
