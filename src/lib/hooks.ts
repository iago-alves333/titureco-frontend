import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { AttractionResponse, SpringPage } from '@/types/api';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Titureco` : 'Titureco · Atrações turísticas';
  }, [title]);
}

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function useMyAttractions(userId?: string, isAdmin = false) {
  return useQuery({
    queryKey: ['attractions', 'mine', userId, isAdmin],
    enabled: Boolean(userId),
    queryFn: async () => {
      // ponytail: no backend filter by guideId; fetch up to 200 and filter client-side.
      // Ceiling: breaks past ~200 attractions. Upgrade: add ?guideId= filter on GET /api/v1/attractions.
      const { data } = await api.get<SpringPage<AttractionResponse>>('/api/v1/attractions', {
        params: { size: 200 },
      });
      const list = data.content ?? [];
      return isAdmin ? list : list.filter((a) => a.guideId === userId);
    },
  });
}
