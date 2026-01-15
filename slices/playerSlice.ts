import { Track } from '@/types/track';
import { REPEAT_MODES } from '../utils/constants/ui';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlayDestination = null | string;

export type RepeatTypes = 'off' | 'all' | 'one';

interface InitialState {
  isPlay: boolean;
  seek: number;
  isShuffle: boolean;
  isRepeat: RepeatTypes;
  currentPlayedTrackId: number | null;
  currentPreviewTrackId: string | null;
  queue: Track[] | null;
  shuffledQueue: Track[] | null;
  playDestination: PlayDestination;
  progress: number;
  volume: number;
  isMuted: boolean;
  triggerLikeTrackId: number | null;
}

export const initialState: InitialState = {
  isPlay: false,
  seek: 0,
  isShuffle: false,
  isRepeat: REPEAT_MODES.OFF,
  currentPlayedTrackId: null,
  currentPreviewTrackId: null,
  queue: null,
  shuffledQueue: null,
  playDestination: null,
  progress: 0,
  volume: 1,
  isMuted: false,
  triggerLikeTrackId: null
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlay: (state, action: PayloadAction<InitialState['isPlay']>) => {
      state.isPlay = action.payload;
    },
    setSeek: (state, action: PayloadAction<InitialState['seek']>) => {
      state.seek = action.payload;
    },
    setIsShuffle: (state, action: PayloadAction<InitialState['isShuffle']>) => {
      state.isShuffle = action.payload;
    },
    toggleRepeat(state) {
      state.isRepeat = state.isRepeat === 'off' ? 'all' : state.isRepeat === 'all' ? 'one' : 'off';
    },
    setIsRepeat(state, action: PayloadAction<RepeatTypes>) {
      state.isRepeat = action.payload;
    },
    setCurrentPlayedTrackId: (
      state,
      action: PayloadAction<InitialState['currentPlayedTrackId']>
    ) => {
      state.currentPlayedTrackId = action.payload;
    },
    setQueue: (state, action: PayloadAction<InitialState['queue']>) => {
      state.queue = action.payload;
    },
    setShuffledQueue: (state, action: PayloadAction<InitialState['shuffledQueue']>) => {
      state.shuffledQueue = action.payload;
    },
    setPlayDestination: (state, action: PayloadAction<InitialState['playDestination']>) => {
      state.playDestination = action.payload;
    },
    setProgress: (state, action: PayloadAction<InitialState['progress']>) => {
      state.progress = action.payload;
    },
    setVolume: (state, action: PayloadAction<InitialState['volume']>) => {
      state.volume = action.payload;
    },
    setMuted: (state, action: PayloadAction<InitialState['isMuted']>) => {
      state.isMuted = action.payload;
    },
    setTriggerLike(state, action: PayloadAction<InitialState['triggerLikeTrackId']>) {
      state.triggerLikeTrackId = action.payload;
    }
  }
});

export const {
  setPlay,
  setSeek,
  toggleRepeat,
  setIsShuffle,
  setShuffledQueue,
  setIsRepeat,
  setCurrentPlayedTrackId,
  setQueue,
  setPlayDestination,
  setProgress,
  setVolume,
  setMuted,
  setTriggerLike
} = playerSlice.actions;

export default playerSlice.reducer;
