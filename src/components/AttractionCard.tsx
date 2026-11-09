import { Link } from 'react-router-dom';
import type { AttractionResponse } from '@/types/api';
import attractionImages from '@/data/attraction-images.json';
import { formatBRL } from '@/lib/utils';

interface Props {
  attraction: AttractionResponse;
}

export default function AttractionCard({ attraction: a }: Props) {
  const imageUrl =
    (attractionImages as Record<string, string>)[a.id] ||
    `https://picsum.photos/seed/${a.id}/400/300`;

  return (
    <Link
      to={`/attractions/${a.id}`}
      className="group block rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={a.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 rounded-md bg-background/85 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
          {formatBRL(a.price)}
        </span>
      </div>
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {a.title || 'Sem título'}
        </h3>
        <p className="text-xs text-muted-foreground">{a.guideName || 'Guia'}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span aria-label={`Nota ${Number(a.ratingAverage || 0).toFixed(1)} de 5 em ${a.reviewCount || 0} avaliações`}>
            ★ {Number(a.ratingAverage || 0).toFixed(1)} ({a.reviewCount || 0})
          </span>
          <span>{a.availableSpots || 0} vagas/dia</span>
        </div>
      </div>
    </Link>
  );
}

export function AttractionCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="flex justify-between pt-1">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
