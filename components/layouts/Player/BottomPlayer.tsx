import {
  Dimensions,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  PanResponder,
  StatusBar
} from 'react-native';
import { usePlayer } from '@/hooks/usePlayer';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/store';
import { useEffect, useRef, useState } from 'react';
import { setSeek, setTriggerLike } from '@/slices/playerSlice';
import Slider from '@react-native-community/slider';
import { formatTime } from '@/functions';
import { useProgress } from 'react-native-track-player';
import useThrottledCallback from '@/hooks/useThrottleCallback';
import { RepeatIcon, RepeatOneIcon } from '@/assets/icons/playerIcons';
import { usePathname } from 'expo-router';

const { trackCovers } = Constants.expoConfig?.extra ?? {};

const HEIGHT = 75;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const BottomPlayer = () => {
  const { currentPlayedTrack, handleTogglePlay } = usePlayer();
  const { isAuthenticated } = useSelector((state: any) => state.userStore);
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const {
    isPlay,
    triggerLikeTrackId: triggerLike,
    isRepeat,
    isShuffle
  } = useSelector((state: RootState) => state.playerStore);

  const shuffleColor = isShuffle ? '#7851A9' : '#fff';
  const repeatColor = isRepeat === 'off' ? '#fff' : '#7851A9';

  const { position, duration } = useProgress(0);

  const [positionState, setPositionState] = useState(0);

  const isSeeking = useRef(false);
  const [isLiked, setIsLiked] = useState<boolean | undefined>(undefined);

  const path = usePathname();

  const {
    handlePrev,
    handleNext,
    handleLike,
    handleDelete,
    handleRepeat,
    handleShuffle,
    handleSeek
  } = usePlayer();

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLiked(currentPlayedTrack?.liked);
  }, [currentPlayedTrack?.liked]);

  useEffect(() => {
    if (!isSeeking.current) {
      setPositionState(position);
    }
  }, [position]);

  const openPlayer = () => {
    setIsExpanded(true);
    Animated.spring(sheetY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8
    }).start();
  };

  const closePlayer = () => {
    Animated.spring(sheetY, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      friction: 8
    }).start(() => setIsExpanded(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          sheetY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          closePlayer();
        } else {
          openPlayer();
        }
      }
    })
  ).current;

  const throttledDispatchProgress = useThrottledCallback((value) => {
    handleSeek(value);
  }, 1_000);

  if (!currentPlayedTrack) return null;

  return (
    <>
      <Animated.View
        style={[styles.timeSplit]}
        {...panResponder.panHandlers}>
        <View style={styles.swipeIndicator}>
          <View style={styles.swipeBar} />
        </View>
        <View style={styles.container}>
          <Pressable
            style={styles.info}
            onPress={openPlayer}>
            <Image
              source={{
                uri: `${trackCovers}${currentPlayedTrack.tracks_graphics?.[0]?.cover ?? 'default.png'}`
              }}
              style={styles.cover}
            />

            <View style={{ maxWidth: SCREEN_WIDTH - 175 }}>
              <Text
                style={styles.title}
                numberOfLines={1}>
                {currentPlayedTrack.title}
              </Text>
              <Text
                style={styles.artist}
                numberOfLines={1}>
                {currentPlayedTrack.artist_name}
              </Text>
            </View>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              style={{ marginRight: 20 }}
              onPress={() => {
                if (isLiked) {
                  handleDelete(currentPlayedTrack?.id_track);
                } else {
                  handleLike(currentPlayedTrack?.id_track);
                }
                dispatch(setTriggerLike(currentPlayedTrack?.id_track));
              }}>
              <Ionicons
                name='heart'
                size={20}
                color={isLiked ? '#b70000ff' : '#b0b0b0'}
              />
            </Pressable>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleTogglePlay(currentPlayedTrack)}>
              <Ionicons
                name={isPlay ? 'pause' : 'play'}
                size={24}
                color='#000000ff'
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {isExpanded && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.fullPlayer,
            {
              transform: [{ translateY: sheetY }]
            }
          ]}>
          <View style={styles.fullPlayerContent}>
            <Pressable
              style={styles.closeButton}
              onPress={closePlayer}>
              <Ionicons
                name='chevron-down'
                size={32}
                color='#fff'
              />
            </Pressable>

            <Image
              source={{
                uri: `${trackCovers}${currentPlayedTrack.tracks_graphics?.[0]?.cover ?? 'default.png'}`
              }}
              style={styles.largeCover}
            />
            <View style={styles.trackInfo}>
              <Text
                style={styles.largeTitle}
                numberOfLines={2}>
                {currentPlayedTrack.title}
              </Text>
              <Text
                style={styles.largeArtist}
                numberOfLines={1}>
                {currentPlayedTrack.artist_name}
              </Text>
            </View>

            <View style={styles.extraControls}>
              <Pressable
                onPress={() => {
                  if (isLiked) {
                    handleDelete(currentPlayedTrack?.id_track);
                  } else {
                    handleLike(currentPlayedTrack?.id_track);
                  }
                  dispatch(setTriggerLike(currentPlayedTrack?.id_track));
                }}>
                <Ionicons
                  name='heart'
                  size={28}
                  color={isLiked ? '#b70000ff' : '#b0b0b0'}
                />
              </Pressable>
            </View>

            <View style={styles.progressContainer}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={Number(currentPlayedTrack?.duration ?? 0)}
                value={positionState}
                step={1}
                minimumTrackTintColor='#863fb5'
                maximumTrackTintColor='rgba(255,255,255,0.3)'
                thumbTintColor='#863fb5'
                onValueChange={(value) => {
                  isSeeking.current = true;
                  setPositionState(value);
                }}
                onSlidingComplete={(value) => {
                  isSeeking.current = false;
                  throttledDispatchProgress(value);
                }}
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position * 1000)}</Text>
                <Text style={styles.timeText}>
                  {formatTime(Math.floor(Number(currentPlayedTrack.duration) * 1000))}
                </Text>
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <Pressable onPress={() => handleShuffle()}>
                <Ionicons
                  name='shuffle'
                  size={28}
                  color={shuffleColor}
                />
              </Pressable>

              <Pressable onPress={handlePrev}>
                <Ionicons
                  name='play-skip-back'
                  size={40}
                  color='#fff'
                />
              </Pressable>

              <TouchableOpacity
                style={styles.largePlayButton}
                onPress={() => handleTogglePlay(currentPlayedTrack)}>
                <Ionicons
                  name={isPlay ? 'pause' : 'play'}
                  size={40}
                  color='#000000ff'
                />
              </TouchableOpacity>

              <Pressable onPress={handleNext}>
                <Ionicons
                  name='play-skip-forward'
                  size={40}
                  color='#fff'
                />
              </Pressable>

              <Pressable onPress={handleRepeat}>
                {isRepeat === 'one' ? (
                  <RepeatOneIcon
                    size={28}
                    color={repeatColor}
                  />
                ) : (
                  <RepeatIcon
                    size={28}
                    color={repeatColor}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default BottomPlayer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEIGHT,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1
  },
  timeSplit: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: HEIGHT,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    zIndex: 1000
  },
  swipeIndicator: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1
  },
  swipeBar: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2
  },
  info: {
    flexDirection: 'row'
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  artist: {
    color: '#aaa',
    fontSize: 12
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 24,
    marginRight: 10
  },
  fullPlayer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#111',
    zIndex: 2000
  },
  fullPlayerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 10
  },
  largeCover: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30
  },
  largeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  largeArtist: {
    color: '#aaa',
    fontSize: 18,
    textAlign: 'center'
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  timeText: {
    color: '#aaa',
    fontSize: 12
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  largePlayButton: {
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center'
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
});
