import { Track } from '@/types/track';

export const generateShuffledQueue = (startTrack: Track, originalQueue: Track[]): Track[] => {
  if (!originalQueue || originalQueue.length === 0) {
    return startTrack ? [startTrack] : [];
  }
  if (originalQueue.length === 1 && originalQueue[0].id_track === startTrack.id_track) {
    return [startTrack];
  }

  const queueCopy = originalQueue.filter((track) => track.id_track !== startTrack.id_track);

  for (let i = queueCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queueCopy[i], queueCopy[j]] = [queueCopy[j], queueCopy[i]];
  }

  return [startTrack, ...queueCopy];
};
