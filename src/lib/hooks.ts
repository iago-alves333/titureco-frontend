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
      // ponytail: single-page fetch capped at backend max-page-size (100).
      // Ceiling: lists above 100 items truncate. Upgrade: paginate Dashboard/MapRegister.
      const { data } = await api.get<SpringPage<AttractionResponse>>('/api/v1/attractions', {
        params: isAdmin ? { size: 100 } : { guideId: userId, size: 100 },
      });
      return data.content ?? [];
    },
  });
}
