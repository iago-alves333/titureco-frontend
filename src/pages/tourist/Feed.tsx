import { useEffect, useState, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import AttractionCard from '@/components/AttractionCard';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 12;

export default function Feed() {
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (pageNum: number, kw: string, append: boolean) => {
    setLoading(true);
    try {
      const endpoint = kw.trim() ? '/api/v1/attractions/search' : '/api/v1/attractions';
      const params: Record<string, string | number> = { page: pageNum, size: PAGE_SIZE };
      if (kw.trim()) params.keyword = kw.trim();

      const { data } = await api.get<SpringPage<AttractionResponse>>(endpoint, { params });
      const items = data.content ?? [];
      setAttractions((prev) => append ? [...prev, ...items] : items);
      setHasMore(!data.last);
      setPage(pageNum);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(0, '', false);
  }, [fetchPage]);

  function handleSearch() {
    fetchPage(0, keyword, false);
  }

  function handleLoadMore() {
    fetchPage(page + 1, keyword, true);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero + Search ────────────────────────────────────── */}
      <section className="px-4 pt-8 pb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Descubra atrações incríveis
        </h2>
        <p className="text-muted-foreground mb-6">
          Explore destinos turísticos e reserve sua próxima aventura
        </p>

        <div className="mx-auto flex max-w-xl gap-2">
          <Input
            placeholder="Buscar atrações…"
            value={keyword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Buscar</Button>
          <Button variant="outline" onClick={() => navigate('/nearby')}>📍 Perto de Mim</Button>
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        {attractions.length === 0 && !loading ? (
          <p className="text-center text-muted-foreground py-16">Nenhuma atração encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a) => (
              <AttractionCard key={a.id} attraction={a} />
            ))}
          </div>
        )}

        {hasMore && attractions.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
              {loading ? 'Carregando…' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
