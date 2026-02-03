import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Image
} from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import MusicBar from '@/components/elements/MusicBar/bar';
import { usePlayer } from '@/hooks/usePlayer';
import { setCurrentPlayedTrackId, setQueue } from '@/slices/playerSlice';
import { useDispatch } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { useGetMyPlaylistsQuery, useGetMyPlaylistTracksQuery } from '@/services/playlistApi';
import { useLocalSearchParams } from 'expo-router';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useVibrantColor } from '@/hooks/useVibrantColor';
import Svg, { Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 35
  },
  Box: {
    height: 250,
    width: screenWidth,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blackGray,
    marginBottom: 20
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: colors.lightPurple,
    height: 50,
    width: 50
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  box: {
    height: 260,
    width: '100%',
    padding: 20,
    overflow: 'hidden'
  },

  animatedBg: {
    position: 'absolute',
    width: '300%',
    height: 400,
    top: -100
  },

  gradient: {
    height: 400,
    width: '100%'
  },

  bottomFade: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    height: 50
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 6,
    marginBottom: 12,
    opacity: 0.7
  },

  textBlock: {
    alignItems: 'center',
    position: 'absolute',
    top: 60
  },

  type: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1
  },

  title: {
    color: 'white',
    fontSize: 40,
    fontWeight: '700'
  },

  count: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4
  },
  placeholderWrapper: {
    marginBottom: 12
  },

  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 6,
    backgroundColor: '#242423',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const { playlistCovers } = Constants.expoConfig?.extra ?? {};

export default function Playlist() {
  const { isDark } = useColorScheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const { id } = useLocalSearchParams();

  const { data: playlists } = useGetMyPlaylistsQuery(undefined, {
    refetchOnMountOrArgChange: false
  });

  const playlistsNormalized = useMemo(() => {
    if (Array.isArray(playlists?.playlists)) {
      return playlists.playlists;
    }
    if (Array.isArray(playlists)) {
      return playlists;
    }
    return [];
  }, [playlists]);

  const playlist = useMemo(() => {
    const idNum = +id;
    return (
      playlistsNormalized.find(
        (p: any) => p?.id_users_playlists === idNum || p?.playlist?.id_users_playlists === idNum
      ) ?? null
    );
  }, [playlistsNormalized, id]);

  const { data: tracksData, isLoading } = useGetMyPlaylistTracksQuery(+id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });

  const handlePress = () => {
    setIsPlaying((prev) => !prev);
  };

  const dispatch = useDispatch();

  const { handleTogglePlay, setupPlayerOnce } = usePlayer({
    queue: tracksData?.tracks ?? []
  });

  useEffect(() => {
    setupPlayerOnce();
  }, [setupPlayerOnce]);

  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: 1,
      duration: 32000,
      useNativeDriver: true
    }).start();
  }, []);

  const translateY = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, -670]
  });

  const iconWay = playlist.playlist ? playlist.playlist.cover_url : playlist.cover_url;

  const imageSrc = `${playlistCovers}${iconWay}`;

  const vibrantColor = useVibrantColor(imageSrc);

  return (
    <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
      <FlatList
        data={[...(tracksData?.tracks ?? [])].reverse()}
        keyExtractor={(item) => String(item.id_track)}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        contentContainerStyle={{
          paddingBottom: 90
        }}
        ListHeaderComponent={
          <>
            <View style={styles.box}>
              <Animated.View
                style={[
                  styles.animatedBg,
                  {
                    transform: [{ rotate: '-45deg' }, { translateY }]
                  }
                ]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    iconWay !== null ? vibrantColor : 'rgb(56, 56, 56)',
                    'transparent'
                  ]}
                  style={styles.gradient}
                />
                <LinearGradient
                  colors={[
                    'transparent',
                    iconWay !== null ? vibrantColor : 'rgb(56, 56, 56)',
                    'transparent'
                  ]}
                  style={styles.gradient}
                />
              </Animated.View>

              <LinearGradient
                colors={['transparent', '#121212']}
                style={styles.bottomFade}
              />

              <View style={styles.content}>
                {iconWay !== null ? (
                  <Shadow
                    distance={20}
                    offset={[0, 15]}
                    startColor='rgba(17, 17, 17, 0.43)'
                    endColor='#00000002'>
                    <Image
                      source={{ uri: imageSrc }}
                      style={styles.image}
                    />
                  </Shadow>
                ) : (
                  <View style={styles.placeholderWrapper}>
                    <Shadow
                      distance={20}
                      offset={[0, 15]}
                      startColor='rgba(17, 17, 17, 0.43)'
                      endColor='#00000002'>
                      <View style={styles.placeholder}>
                        <Svg
                          width={50}
                          height={50}
                          viewBox='0 0 20 24'>
                          <Path
                            d='M9 3v10.56A4 4 0 1 0 11 17V7h6V3H9z'
                            fill='#888'
                          />
                        </Svg>
                      </View>
                    </Shadow>
                  </View>
                )}

                <View style={styles.textBlock}>
                  <Text style={styles.type}>Playlist</Text>
                  <Text style={styles.title}>{playlist?.name || playlist?.playlist?.name}</Text>
                  <Text style={styles.count}>{tracksData?.tracks?.length ?? 0} tracks</Text>
                </View>
              </View>
            </View>
            <View style={{ width: screenWidth, marginLeft: 20, marginBottom: 20 }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isDark ? colors.lightPurple : '#007bff' }
                ]}
                onPress={handlePress}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={isDark ? colors.blackGray : '#fff'}
                />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item: track, index }) => (
          <View style={{ width: screenWidth, alignItems: 'center' }}>
            <MusicBar
              track={track.track}
              index={index}
              onPlay={async () => {
                dispatch(setQueue(tracksData?.tracks ?? []));
                dispatch(setCurrentPlayedTrackId(track.id_track));
                await handleTogglePlay(track);
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator
                size='large'
                color={colors.lightPurple}
              />
            </View>
          ) : (
            <Text style={{ color: colors.white, textAlign: 'center' }}>No tracks</Text>
          )
        }
      />
    </View>
  );
}
