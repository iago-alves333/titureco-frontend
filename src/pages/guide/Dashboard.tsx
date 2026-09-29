import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

import AttractionCard from '@/components/AttractionCard';

export default function GuideDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAttractions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // ponytail: no backend filter by guideId; fetch all and filter client-side.
      // Ceiling: breaks past ~1000 attractions per guide. Upgrade: add backend filter.
      const { data } = await api.get<SpringPage<AttractionResponse>>('/api/v1/attractions', { params: { size: 200 } });
      const list = data.content ?? [];
      setAttractions(list.filter((a) => a.guideId === user.id));
    } catch {
      // leave empty
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyAttractions();
  }, [fetchMyAttractions]);

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
    <>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Minhas Atrações</h2>
          <Button onClick={() => navigate('/guide/map')}>+ Cadastrar Nova</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : attractions.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhuma atração cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a) => (
              <div key={a.id} className="relative">
                <AttractionCard attraction={a} />
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={(e) => { e.stopPropagation(); navigate(`/guide/attractions/${a.id}/participants`); }}
                  >
                    Participantes
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
