import {
  Dimensions,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  PanResponder
} from 'react-native';
import { usePlayer } from '@/hooks/usePlayer';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { setSeek, setTriggerLike } from '@/slices/playerSlice';
import Slider from '@react-native-community/slider';
import { formatTime } from '@/functions';
import { useProgress } from 'react-native-track-player';
import useThrottledCallback from '@/hooks/useThrottleCallback';
import { RepeatIcon, RepeatOneIcon } from '@/assets/icons/playerIcons';
import { usePathname } from 'expo-router';
import { ImageBackground } from 'expo-image';
import { colors } from '@/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming
} from 'react-native-reanimated';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';

const { trackCovers } = Constants.expoConfig?.extra ?? {};

const HEIGHT = 75;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const BottomPlayer = () => {
  const { currentPlayedTrack, handleTogglePlay } = usePlayer();
  const { isAuthenticated } = useSelector((state: any) => state.userStore);
  const [isExpanded, setIsExpanded] = useState(false);

  const { isPlay, isRepeat, isShuffle } = useSelector((state: RootState) => state.playerStore);

  const shuffleColor = isShuffle ? '#7851A9' : '#fff';
  const repeatColor = isRepeat === 'off' ? '#fff' : '#7851A9';

  const { position, duration } = useProgress(0);

  const [positionState, setPositionState] = useState(0);
  const isSeeking = useState(false)[0];
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

  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    setIsLiked(currentPlayedTrack?.liked);
  }, [currentPlayedTrack?.liked]);

  useEffect(() => {
    if (!isSeeking) {
      setPositionState(position);
    }
  }, [position]);

  useEffect(() => {
    if (!isExpanded) {
      translateY.value = 0;
    }
  }, [isExpanded]);

  const openPlayer = () => {
    setIsExpanded(true);
    translateY.value = withSpring(SCREEN_HEIGHT, {
      damping: 100,
      stiffness: 250
    });
  };

  const closePlayer = () => {
    translateY.value = withSpring(
      0,
      {
        damping: 30,
        stiffness: 120
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsExpanded)(false);
        }
      }
    );
  };

  const miniPlayerGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationY < -50) {
      runOnJS(openPlayer)();
    }

    const SWIPE_THRESHOLD = 100;
    if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
      if (event.translationX > 0) {
        runOnJS(handlePrev)();
      } else {
        runOnJS(handleNext)();
      }
    }
  });

  // const fullPlayerGesture = Gesture.Pan()
  //   .onStart(() => {
  //     startY.value = translateY.value;
  //   })
  //   .onUpdate((event) => {
  //     const newY = startY.value - event.translationY;
  //     if (newY >= 0 && newY <= SCREEN_HEIGHT) {
  //       translateY.value = newY;
  //     }
  //   })
  //   .onEnd((event) => {
  //     const SWIPE_THRESHOLD = 100;

  //     if (event.translationY > 150) {
  //       runOnJS(closePlayer)();
  //     } else if (
  //       Math.abs(event.translationY) < 50 &&
  //       Math.abs(event.translationX) > SWIPE_THRESHOLD
  //     ) {
  //       if (event.translationX > 0) {
  //         runOnJS(handlePrev)();
  //       } else {
  //         runOnJS(handleNext)();
  //       }
  //       translateY.value = withSpring(SCREEN_HEIGHT, {
  //         damping: 25,
  //         stiffness: 120
  //       });
  //     } else {
  //       translateY.value = withSpring(SCREEN_HEIGHT, {
  //         damping: 25,
  //         stiffness: 120
  //       });
  //     }
  //   });

  const animatedFullPlayerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -translateY.value }]
    };
  });

  const fadeAnim = useSharedValue(isPlay ? 0 : 1);

  const blurValue = useSharedValue(isPlay ? 0 : 15);

  useEffect(() => {
    fadeAnim.value = withTiming(isPlay ? 0 : 1, {
      duration: 300
    });
    blurValue.value = withTiming(isPlay ? 0 : 15, {
      duration: 300
    });
  }, [isPlay]);

  const [containerWidth, setContainerWidth] = useState(0);

  const handleSeekSlider = (locationX: number, release = false) => {
    if (!containerWidth) return;

    const percent = Math.max(0, Math.min(1, locationX / containerWidth));
    const newPosition = percent * duration;

    setPositionState(newPosition);
    handleSeek(newPosition);

    if (release) {
      throttledDispatchProgress(newPosition);
    }
  };

  const waveformData = useMemo(() => {
    return Array.from({ length: 100 }).map(() => Math.random() * 60 + 20);
  }, []);

  const translateX = useSharedValue(0);

  const sliderGesture = Gesture.Pan()
    .minDistance(5) // Мінімальна відстань перед активацією
    .onBegin((event) => {
      translateX.value = (positionState / duration) * containerWidth;
    })
    .onUpdate((event) => {
      // Визначаємо напрямок руху
      const isHorizontal = Math.abs(event.translationX) > Math.abs(event.translationY);

      if (!isHorizontal) return; // Ігноруємо вертикальні рухи

      let newX = (positionState / duration) * containerWidth + event.translationX;
      newX = Math.max(0, Math.min(newX, containerWidth));

      translateX.value = newX;

      const percent = newX / containerWidth;
      const newTime = percent * duration;

      runOnJS(setPositionState)(newTime);
    })
    .onEnd(() => {
      const percent = translateX.value / containerWidth;
      const newTime = percent * duration;

      runOnJS(handleSeek)(newTime);
    });

  // Жест для всієї зони прогресу (альтернативний метод - тап)
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const locationX = event.x;
    const percent = Math.max(0, Math.min(1, locationX / containerWidth));
    const newTime = percent * duration;

    runOnJS(setPositionState)(newTime);
    runOnJS(handleSeek)(newTime);
  });

  // Комбінований жест
  const combinedGesture = Gesture.Race(tapGesture, sliderGesture);

  // Оновлений жест для шторки з виключенням зони слайдера
  const fullPlayerGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Визначаємо чи це вертикальний рух
      const isVertical = Math.abs(event.translationY) > Math.abs(event.translationX);

      if (!isVertical) return; // Ігноруємо горизонтальні рухи

      const newY = startY.value - event.translationY;
      if (newY >= 0 && newY <= SCREEN_HEIGHT) {
        translateY.value = newY;
      }
    })
    .onEnd((event) => {
      const SWIPE_THRESHOLD = 100;
      const isVertical = Math.abs(event.translationY) > Math.abs(event.translationX);

      if (isVertical && event.translationY > 150) {
        runOnJS(closePlayer)();
      } else if (
        !isVertical &&
        Math.abs(event.translationY) < 50 &&
        Math.abs(event.translationX) > SWIPE_THRESHOLD
      ) {
        if (event.translationX > 0) {
          runOnJS(handlePrev)();
        } else {
          runOnJS(handleNext)();
        }
        translateY.value = withSpring(SCREEN_HEIGHT, {
          damping: 25,
          stiffness: 120
        });
      } else {
        translateY.value = withSpring(SCREEN_HEIGHT, {
          damping: 25,
          stiffness: 120
        });
      }
    });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  const throttledDispatchProgress = useThrottledCallback((value) => {
    handleSeek(value);
  }, 1_000);

  if (!currentPlayedTrack) return null;

  return (
    <GestureHandlerRootView style={{ zIndex: 10 }}>
      <GestureDetector gesture={miniPlayerGesture}>
        <Animated.View style={[styles.timeSplit]}>
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
      </GestureDetector>

      {isExpanded && (
        <GestureDetector gesture={fullPlayerGesture}>
          <Animated.View style={[styles.fullPlayer, animatedFullPlayerStyle]}>
            <TouchableOpacity
              style={{
                height: '90%',
                borderRadius: 20,
                overflow: 'hidden'
              }}
              activeOpacity={0.8}
              onPress={() => handleTogglePlay(currentPlayedTrack)}>
              <ImageBackground
                source={{
                  uri: `${trackCovers}${currentPlayedTrack.tracks_graphics?.[0]?.cover ?? 'default.png'}`
                }}
                style={styles.backgroundImage}
                blurRadius={isPlay ? 0 : blurValue.value}>
                <View style={styles.fullPlayerContent}>
                  <View style={styles.closeWrapper}>
                    <View style={{ maxWidth: SCREEN_WIDTH - 105 }}>
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
                    </View>
                    <View style={{ paddingTop: 5 }}>
                      <View>
                        <Pressable
                          style={styles.closeButton}
                          onPress={closePlayer}>
                          <Ionicons
                            name='chevron-down'
                            size={32}
                            color='#fff'
                          />
                        </Pressable>
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
                    </View>
                  </View>
                  <View style={{ height: '90%', justifyContent: 'center' }}>
                    <Animated.View
                      style={[
                        styles.controlsContainer,
                        {
                          opacity: fadeAnim,
                          transform: [{ scale: fadeAnim }]
                        }
                      ]}
                      pointerEvents={isPlay ? 'none' : 'auto'}>
                      <Pressable
                        onPress={handlePrev}
                        style={styles.controlButton}>
                        <Ionicons
                          name='play-skip-back'
                          size={20}
                          color='#fff'
                        />
                      </Pressable>
                      <TouchableOpacity
                        style={styles.largePlayButton}
                        onPress={() => handleTogglePlay(currentPlayedTrack)}>
                        <Ionicons
                          name={isPlay ? 'pause' : 'play'}
                          size={25}
                          color='white'
                        />
                      </TouchableOpacity>
                      <Pressable
                        onPress={handleNext}
                        style={styles.controlButton}>
                        <Ionicons
                          name='play-skip-forward'
                          size={20}
                          color='#fff'
                        />
                      </Pressable>
                    </Animated.View>

                    <View
                      style={styles.progressContainer}
                      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
                      {/* Видаліть touchArea і замініть на GestureDetector */}
                      <GestureDetector gesture={combinedGesture}>
                        <View style={styles.touchArea} />
                      </GestureDetector>

                      <View style={styles.waveformContainer}>
                        <View style={styles.waveformBars}>
                          {waveformData.map((height, i) => {
                            const progressPercent = (positionState / duration) * 100;
                            const barProgress = (i / waveformData.length) * 100;
                            const isPlayed = barProgress <= progressPercent;

                            return (
                              <View
                                key={i}
                                style={[
                                  styles.waveformBar,
                                  {
                                    height,
                                    backgroundColor: isPlayed ? '#863fb5' : 'rgba(255,255,255,0.3)'
                                  }
                                ]}
                              />
                            );
                          })}
                        </View>

                        {/* Індикатор позиції */}
                        <Animated.View
                          style={[
                            styles.positionIndicator,
                            {
                              left: `${(positionState / duration) * 100}%`
                            }
                          ]}
                        />

                        {/* Час поверх */}
                        <View style={styles.timeOverlay}>
                          <View style={styles.timeBox}>
                            <Text style={styles.timeText}>{formatTime(positionState * 1000)}</Text>
                          </View>
                          <View style={styles.timeBox}>
                            <Text style={styles.timeText}>{formatTime(duration * 1000)}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(positionState * 1000)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration * 1000)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-between',
                marginHorizontal: 30,
                top: 30
              }}>
              <Pressable onPress={() => handleShuffle()}>
                <Ionicons
                  name='shuffle'
                  size={28}
                  color={shuffleColor}
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
          </Animated.View>
        </GestureDetector>
      )}
    </GestureHandlerRootView>
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
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
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
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#111',
    zIndex: 2000,
    overflow: 'hidden'
  },
  fullPlayerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40
  },
  closeWrapper: {
    zIndex: 10,
    width: '100%',
    top: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    alignSelf: 'center',
    padding: 3
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
    alignItems: 'flex-start',
    marginTop: 10,
    marginLeft: 5
  },
  largeTitle: {
    color: colors.white,
    fontSize: 18,
    backgroundColor: 'black',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    width: '100%',
    padding: 1,
    alignSelf: 'flex-start'
  },
  largeArtist: {
    color: colors.lightGray,
    fontSize: 15,
    backgroundColor: 'black',
    borderRadius: 4,
    paddingHorizontal: 8,
    padding: 1,
    textAlign: 'center',
    alignSelf: 'flex-start'
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 150,
    paddingHorizontal: 20
  },
  largePlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    width: 50,
    height: 50,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    width: 40,
    height: 40,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center'
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: '#00000034',
    borderRadius: 50,
    top: 10,
    padding: 5
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 2
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#863fb5'
  },
  waveformBar: {
    flex: 1,
    marginHorizontal: 0.5,
    borderRadius: 0.5,
    minWidth: 1.5
  },
  positionIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#000000',
    zIndex: 10,
    marginLeft: -1
  },
  timeBox: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  bigSwipeZone: {
    position: 'absolute',
    top: -50,
    bottom: -50,
    left: 0,
    right: 0,
    zIndex: 10
  },
  waveformContainer: {
    height: 80,
    justifyContent: 'center',
    zIndex: 1
  },
  progressContainer: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center'
  },
  timeOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: -14,
    pointerEvents: 'none'
  },
  touchArea: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: 0,
    right: 0,
    zIndex: 10
  }
});
