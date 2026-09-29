import { useNavigate } from 'react-router-dom';
import type { AttractionResponse } from '@/types/api';
import attractionImages from '@/data/attraction-images.json';

interface Props {
  attraction: AttractionResponse;
}

export default function AttractionCard({ attraction: a }: Props) {
  const navigate = useNavigate();
  const imageUrl = (attractionImages as Record<string, string>)[a.id] || `https://picsum.photos/seed/${a.id}/400/300`;

  return (
    <div
      onClick={() => navigate(`/attractions/${a.id}`)}
      className="group cursor-pointer rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={a.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
          R$ {Number(a.price || 0).toFixed(2)}
        </span>
      </div>
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{a.title || 'Sem título'}</h3>
        <p className="text-xs text-muted-foreground">{a.guideName || 'Guia'}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>⭐ {Number(a.ratingAverage || 0).toFixed(1)} ({a.reviewCount || 0})</span>
          <span>{a.availableSpots || 0} vagas</span>
        </div>
      </div>
    </div>
  );
}
