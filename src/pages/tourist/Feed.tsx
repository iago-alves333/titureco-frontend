import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import AttractionCard, { AttractionCardSkeleton } from '@/components/AttractionCard';
import { cn, getErrorMessage } from '@/lib/utils';
import { useDebouncedValue, usePageTitle } from '@/lib/hooks';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'title,asc', label: 'Nome (A–Z)' },
  { value: 'price,asc', label: 'Menor preço' },
  { value: 'price,desc', label: 'Maior preço' },
  { value: 'ratingAverage,desc', label: 'Melhor avaliação' },
] as const;

export default function Feed() {
  usePageTitle('Explorar Atrações');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'title,asc';

  const [keyword, setKeyword] = useState(initialQ);
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);

  // Sync debounced keyword to URL query params
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedKeyword) {
      next.set('q', debouncedKeyword);
    } else {
      next.delete('q');
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [debouncedKeyword, searchParams, setSearchParams]);

  function handleSortChange(newSort: string) {
    const next = new URLSearchParams(searchParams);
    if (newSort && newSort !== 'title,asc') {
      next.set('sort', newSort);
    } else {
      next.delete('sort');
    }
    setSearchParams(next, { replace: true });
  }

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['attractions', 'feed', debouncedKeyword, sort],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const endpoint = debouncedKeyword ? '/api/v1/attractions/search' : '/api/v1/attractions';
      const params: Record<string, string | number> = {
        page: pageParam,
        size: PAGE_SIZE,
        sort,
      };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      const res = await api.get<SpringPage<AttractionResponse>>(endpoint, { params });
      return res.data;
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.currentPage + 1),
  });

  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error, 'Não foi possível carregar as atrações.'));
    }
  }, [isError, error]);

  const attractions = data?.pages.flatMap((p) => p.content ?? []) ?? [];

  return (
    <>
      {/* ── Hero + Search ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
          Descubra atrações incríveis
        </h1>
        <p className="text-muted-foreground mb-6">
          Explore destinos turísticos e reserve sua próxima aventura
        </p>

        <div className="mx-auto flex flex-wrap max-w-2xl gap-2 justify-center">
          <Input
            type="search"
            aria-label="Buscar atrações por palavra-chave"
            placeholder="Buscar atrações…"
            value={keyword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <select
            aria-label="Ordenar atrações"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Link to="/nearby" className={cn(buttonVariants({ variant: 'outline' }))}>
            Perto de Mim
          </Link>
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <AttractionCardSkeleton key={i} />
            ))}
          </div>
        ) : attractions.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Nenhuma atração encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a) => (
              <AttractionCard key={a.id} attraction={a} />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
