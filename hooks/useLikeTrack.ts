import { likeTrackThunk } from '@/services/likedThunk';
import { useAppDispatch } from '.';

export const useLikeTrack = () => {
  const dispatch = useAppDispatch();

  const likeTrack = (trackId: number) => dispatch(likeTrackThunk(trackId)).unwrap();

  return { likeTrack };
};
