import styles from './LocationMap.module.css';
import { coordsForNeighbourhood } from '@/lib/geo';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

interface LocationMapProps {
  neighbourhood: string;
}

export function LocationMap({ neighbourhood }: LocationMapProps) {
  const { lat, lng } = coordsForNeighbourhood(neighbourhood);

  const src = GOOGLE_MAPS_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(
        `${neighbourhood}, Montreal, QC`
      )}&zoom=14`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.012}%2C${
        lng + 0.02
      }%2C${lat + 0.012}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={styles.wrapper}>
      <iframe
        title={`Map of ${neighbourhood}`}
        src={src}
        className={styles.frame}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <span className={styles.label}>{neighbourhood}, Montreal</span>
    </div>
  );
}
