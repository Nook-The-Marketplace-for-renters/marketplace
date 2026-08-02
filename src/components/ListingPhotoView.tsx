import type { ListingPhoto } from '@/types';

interface ListingPhotoViewProps {
  photo: ListingPhoto;
  className?: string;
}

export function ListingPhotoView({ photo, className }: ListingPhotoViewProps) {
  return <img src={photo.url} alt={photo.name ?? ''} className={className} />;
}
