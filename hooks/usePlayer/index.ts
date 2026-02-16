import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TrackPlayer, {
  RepeatMode,
  Capability,
  isPlaying,
  State,
  useProgress,
  Event
} from 'react-native-track-player';
import { Track } from '@/types/track';
import Constants from 'expo-constants';
import { HandleTogglePlay, UsePlayerProps } from './props';
import { useDispatch, useSelector } from 'react-redux';
import {
  RepeatTypes,
  setCurrentPlayedTrackId,
  setIsRepeat,
  setIsShuffle,
  setPlay,
  setProgress,
  setSeek,
  setShuffledQueue,
  setTriggerLike,
  toggleRepeat
} from '@/slices/playerSlice';
import { RootState } from '@/utils/store';
import { useDeleteLikedTrackMutation, useSetLikedTracksMutation } from '@/services/userApi';
import { generateShuffledQueue } from '@/functions/generateShuffled';
import { REPEAT_MODES } from '@/utils/constants/ui';

const { staticMedia, trackCovers } = Constants.expoConfig?.extra ?? {};

export const usePlayer = (props?: Partial<UsePlayerProps>) => {
  const { queue: queueProp } = props || {};

  const isInitialized = useRef(false);

  const dispatch = useDispatch();

  const { position, duration } = useProgress(0);

  const [likeTrack] = useSetLikedTracksMutation();
  const [deleteLikedTrack] = useDeleteLikedTrackMutation();

  const {
    currentPlayedTrackId,
    queue: reduxQueue,
    shuffledQueue,
    isPlay,
    isRepeat,
    isShuffle
  } = useSelector((state: RootState) => state.playerStore);

  const currentQueue = isShuffle ? shuffledQueue : (queueProp ?? reduxQueue);

  const stableQueue = queueProp ?? currentQueue;

  const repeatToTrackPlayer = (repeat: RepeatTypes) => {
    switch (repeat) {
      case 'one':
        return RepeatMode.Track;
      case 'all':
        return RepeatMode.Queue;
      default:
        return RepeatMode.Off;
    }
  };

  const getAudioSrc = useCallback((track: Track): string => {
    if (!staticMedia || !track?.path) return '';

    return `${staticMedia.replace(/\/$/, '')}/${track.path.replace(/\.mp3$/, '')}.mp3`;
  }, []);

  const setupPlayerOnce = useCallback(async () => {
    if (isInitialized.current) return;

    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious
        ]
      });
      isInitialized.current = true;
      console.log('TrackPlayer initialized');
    } catch (e) {
      console.log('TrackPlayer setup error:', e);
    }
  }, []);

  const queue = useMemo<Track[]>(() => {
    return Array.isArray(stableQueue) ? stableQueue : [];
  }, [stableQueue]);

  const currentPlayedTrack = useMemo(() => {
    return queue.find((q) => q.id_track === currentPlayedTrackId);
  }, [currentPlayedTrackId, queue]);

  const isFirst =
    currentQueue != null &&
    currentPlayedTrack &&
    currentQueue.length > 0 &&
    currentQueue[0]?.id_track === currentPlayedTrack.id_track;

  const isLast =
    currentQueue != null &&
    currentPlayedTrack &&
    currentQueue.length > 0 &&
    currentQueue![currentQueue!.length - 1]?.id_track === currentPlayedTrack.id_track;

  const handlePlay = useCallback(async () => {
    await TrackPlayer.play();
    return true;
  }, [dispatch]);

  const handlePause = useCallback(async () => {
    await TrackPlayer.pause();
    return false;
  }, [dispatch]);

  const handleRepeat = useCallback(() => {
    dispatch(toggleRepeat());
  }, [dispatch]);

  const handleSeek = useCallback(async (seek: number) => {
    await TrackPlayer.seekTo(seek);
    dispatch(setSeek(seek));
  }, []);

  const handleShuffle = useCallback(
    async (startTrack?: Track, regenerateOnly = false) => {
      if (queueProp) {
        const baseTrack = startTrack ?? currentPlayedTrack;
        if (baseTrack) {
          const newQueue = generateShuffledQueue(baseTrack, queueProp ?? []);
          dispatch(setShuffledQueue(newQueue));
        }
      }

      if (!startTrack && !regenerateOnly) {
        dispatch(setIsShuffle(!isShuffle));
      }
    },
    [currentPlayedTrack, queueProp, dispatch, isShuffle]
  );

  const handleTogglePlay: HandleTogglePlay = useCallback(
    async (track, options) => {
      const { skipShuffle } = options || {};

      if (!track) return;

      if (track && track.id_track !== currentPlayedTrackId) {
        dispatch(setSeek(0));
        dispatch(setPlay(true));
      }

      if (!skipShuffle && !currentPlayedTrackId && track?.id_track !== currentPlayedTrackId) {
        handleShuffle(track, true);
      }

      await setupPlayerOnce();

      const isSameTrack = track.id_track === currentPlayedTrackId;

      if (isSameTrack) {
        if (isPlay) {
          await handlePause();
          dispatch(setPlay(false));
        } else {
          await handlePlay();
          dispatch(setPlay(true));
          dispatch(setTriggerLike(null));
        }
        return;
      }

      const url = getAudioSrc(track);
      if (!url) {
        console.log('❌ empty audio url');
        return;
      }

      try {
        await TrackPlayer.reset();

        await TrackPlayer.add({
          id: track.id_track.toString(),
          url,
          title: track.title,
          artist: track.artist_name,
          artwork: `${trackCovers}${track?.tracks_graphics?.[0]?.cover ?? 'default.png'}`
        });

        dispatch(setCurrentPlayedTrackId(track.id_track));

        await handlePlay();
        dispatch(setPlay(true));
      } catch (e) {
        console.log('❌ Error playing track:', e);
      }
    },
    [
      currentPlayedTrackId,
      dispatch,
      getAudioSrc,
      handlePause,
      handlePlay,
      handleShuffle,
      isPlay,
      setupPlayerOnce
    ]
  );

  const handleTrackSwitch = useCallback(
    (direction: number) => {
      const currentIndex = queue.findIndex((track) => track.id_track === currentPlayedTrackId);

      const nextTrack = queue[currentIndex + direction];

      if (!nextTrack) {
        handlePause();
        return;
      }

      dispatch(setTriggerLike(null));
      handleTogglePlay(nextTrack, { skipShuffle: true });
    },
    [currentPlayedTrackId, queue, handleTogglePlay, handlePause, dispatch]
  );
  const handlePrev = useCallback(() => {
    if (isRepeat === REPEAT_MODES.ALL && currentQueue && isFirst) {
      const lastTrack = currentQueue[currentQueue.length - 1];
      handleTogglePlay(lastTrack, { skipShuffle: true });
      return;
    }

    handleTrackSwitch(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTogglePlay, handleTrackSwitch, isFirst, isRepeat, isShuffle, queue]);

  const handleNext = useCallback(() => {
    if (isRepeat === REPEAT_MODES.ALL && currentQueue && isLast) {
      const repeatQueue = currentQueue[0];

      handleTogglePlay(repeatQueue, { skipShuffle: true });

      return;
    }

    handleTrackSwitch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTogglePlay, handleTrackSwitch, isLast, isRepeat, isShuffle, queue]);

  const handleLike = async (id: number) => {
    try {
      dispatch(setTriggerLike(id));

      await likeTrack({ idTrack: id }).unwrap();
    } catch {}
  };

  const handleDelete = useCallback(
    async (trackId: number) => {
      try {
        dispatch(setTriggerLike(trackId));

        await deleteLikedTrack({ idTrack: trackId }).unwrap();
      } catch {
        /* empty */
      }
    },
    [deleteLikedTrack]
  );

  useEffect(() => {
    TrackPlayer.setRepeatMode(repeatToTrackPlayer(isRepeat));
  }, [isRepeat]);

  useEffect(() => {
    if (!currentPlayedTrackId) return;

    dispatch(setProgress(position));
  }, [position, currentPlayedTrackId]);

  useEffect(() => {
    const playSub = TrackPlayer.addEventListener(Event.RemotePlay, async () => {
      await TrackPlayer.play();
      dispatch(setPlay(true));
    });

    const pauseSub = TrackPlayer.addEventListener(Event.RemotePause, async () => {
      await TrackPlayer.pause();
      dispatch(setPlay(false));
    });

    const nextSub = TrackPlayer.addEventListener(Event.RemoteNext, () => handleNext());

    const prevSub = TrackPlayer.addEventListener(Event.RemotePrevious, () => handlePrev());

    return () => {
      playSub.remove();
      pauseSub.remove();
      nextSub.remove();
      prevSub.remove();
    };
  }, [dispatch, handleNext, handlePrev]);

  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => handleNext());
    return () => subscription.remove();
  }, [handleNext]);

  const lastTrackId = useRef(currentPlayedTrackId);
  const hasAutoSkipped = useRef(false);

  useEffect(() => {
    if (lastTrackId.current !== currentPlayedTrackId) {
      lastTrackId.current = currentPlayedTrackId;
      hasAutoSkipped.current = false;
    }
  }, [currentPlayedTrackId]);

  useEffect(() => {
    if (
      duration > 0 &&
      position >= duration - 0.5 &&
      position < duration &&
      !hasAutoSkipped.current &&
      isPlay
    ) {
      hasAutoSkipped.current = true;
      handleNext();
    }
  }, [position, duration, handleNext, isPlay]);

  return {
    handleTogglePlay,
    setupPlayerOnce,
    currentPlayedTrack,
    handlePlay,
    handleSeek,
    handlePause,
    handlePrev,
    handleNext,
    handleRepeat,
    handleShuffle,
    handleLike,
    handleDelete
  };
};
