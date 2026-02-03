import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated
} from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useGetLikedTracksQuery } from '@/services/userApi';
import MusicBar from '@/components/elements/MusicBar/bar';
import { usePlayer } from '@/hooks/usePlayer';
import { setCurrentPlayedTrackId, setQueue } from '@/slices/playerSlice';
import { useDispatch } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadow } from 'react-native-shadow-2';
import { Image } from 'expo-image';
import Constants from 'expo-constants';

const screenWidth = Dimensions.get('window').width;

const LikedTracks = require('@/assets/images/LikedTracks.jpg');

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
    marginBottom: 20,
    paddingTop: 20,
    overflow: 'hidden'
  },
  container: {
    borderRadius: 12,
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    overflow: 'hidden'
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
    opacity: 0.7,
    marginBottom: 12
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
  }
});

export default function Home() {
  const { isDark } = useColorScheme();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePress = () => {
    setIsPlaying((prev) => !prev);
  };

  const dispatch = useDispatch();

  const { data: likedTracks, isLoading } = useGetLikedTracksQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });

  const { handleTogglePlay, setupPlayerOnce } = usePlayer({
    queue: likedTracks?.tracks ?? []
  });

  useEffect(() => {
    setupPlayerOnce();
  }, [setupPlayerOnce]);

  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: 1.55,
      duration: 32000,
      useNativeDriver: true
    }).start();
  }, []);

  const translateY = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -300]
  });

  return (
    <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
      <FlatList
        data={likedTracks?.tracks ?? []}
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
                    transform: [{ translateY }]
                  }
                ]}>
                <LinearGradient
                  colors={['transparent', 'rgb(99, 22, 192)', 'transparent']}
                  style={styles.gradient}
                />
                <LinearGradient
                  colors={['transparent', 'rgb(99, 22, 192)', 'transparent']}
                  style={styles.gradient}
                />
              </Animated.View>

              <LinearGradient
                colors={['transparent', '#121212']}
                style={styles.bottomFade}
              />

              <View style={styles.content}>
                <Shadow
                  distance={20}
                  offset={[0, 15]}
                  startColor='rgba(17, 17, 17, 0.43)'
                  endColor='#00000002'>
                  <Image
                    source={LikedTracks}
                    style={styles.image}
                  />
                </Shadow>

                <View style={styles.textBlock}>
                  <Text style={styles.type}>Playlist</Text>
                  <Text style={styles.title}>Liked Tracks</Text>
                  <Text style={styles.count}>{likedTracks?.tracks.length} songs</Text>
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
              track={track}
              index={index}
              onPlay={async () => {
                dispatch(setQueue(likedTracks?.tracks ?? []));
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
