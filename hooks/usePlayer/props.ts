import { PlayDestination } from '@/slices/commonSlice';
import { Track } from '@/types/track';

export interface UsePlayerProps {
  queue: Track[];
}

export type CachedTrack = Track & { audioBlob: Blob };

export type HandleTogglePlay = (
  track?: Track,
  options?: {
    skipShuffle?: boolean;
  }
) => void;
