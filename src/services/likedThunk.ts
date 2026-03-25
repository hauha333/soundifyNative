import { createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from './userApi';
import { AppDispatch } from '@/utils/store';

export const likeTrackThunk = createAsyncThunk<
  number,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('tracks/likeTrack', async (trackId, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(userApi.endpoints.setLikedTracks.initiate({ idTrack: trackId })).unwrap();

    return trackId;
  } catch {
    return rejectWithValue('Не вдалося лайкнути');
  }
});
