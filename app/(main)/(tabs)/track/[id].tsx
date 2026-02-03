import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Pressable
} from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/hooks/usePlayer';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useGetMyPlaylistsQuery, useGetMyPlaylistTracksQuery } from '@/services/playlistApi';
import { useLocalSearchParams } from 'expo-router';
import { useVibrantColor } from '@/hooks/useVibrantColor';
import Constants from 'expo-constants';
import { useInitializeMediaMutation, useSearchSongQuery } from '@/services/mediaApi';
import { initialTrackData } from './data/trackData';
import { Image } from 'expo-image';
import { Shadow } from 'react-native-shadow-2';
import SearchBar from '@/components/elements/MusicBar/searchBar';
import MusicBar from '@/components/elements/MusicBar/bar';
import { setCurrentPlayedTrackId, setQueue, setTriggerLike } from '@/slices/playerSlice';
import { LinearGradient } from 'expo-linear-gradient';
import PlaylistUpdate from '@/components/modals/PlaylistUpdate';
import { TrackSkeleton } from '@/components/elements/MusicBar/skeleton';

const screenWidth = Dimensions.get('window').width;

const { trackCovers } = Constants.expoConfig?.extra ?? {};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: screenWidth
  },
  container: {
    borderRadius: 12,
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    overflow: 'hidden'
  },
  Box: {
    minHeight: 280,
    width: screenWidth - 20,
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden'
  },
  title: {
    color: colors.white,
    backgroundColor: 'black',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    width: '90%',
    padding: 1,
    textAlign: 'center',
    alignSelf: 'flex-start'
  },
  buttonTitle: {
    color: colors.lightGray,
    backgroundColor: 'black',
    borderRadius: 4,
    paddingHorizontal: 8,
    padding: 1,
    textAlign: 'center',
    alignSelf: 'flex-start'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: colors.blackGray,
    height: 50,
    width: 50
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default function Track() {
  const { isDark } = useColorScheme();
  const [isPlaying, setIsPlaying] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const createBtnRef = useRef<View | null>(null);

  const { id } = useLocalSearchParams();
  const { isPlay, currentPlayedTrackId } = useSelector((s: any) => s.playerStore);

  const [initializeMedia] = useInitializeMediaMutation();

  const handlePress = () => {
    setIsPlaying((prev) => !prev);
    handleTogglePlay();
  };

  const decodedTrack = useMemo(() => {
    try {
      return JSON.parse(atob(id as string));
    } catch {
      return null;
    }
  }, [id]);

  const { data: trackData, isLoading: isArtistLoading } = useSearchSongQuery(decodedTrack, {
    refetchOnMountOrArgChange: true
  });
  const tracks = trackData?.result?.tracks?.data || [];

  const track =
    tracks.find((t: any) => t.id_youtube?.replace(/^-/, '') === decodedTrack) || initialTrackData;

  const dispatch = useDispatch();

  const isCurrent = track?.id_track === currentPlayedTrackId;
  const isOwned = track?.owned;
  const title = isOwned ? track.name : (track.extraSearch?.name ?? track.name);
  const artist = isOwned
    ? track.artist_name
    : (track.extraSearch?.artist?.name ?? track.artist_name);

  const { data: songsData } = useSearchSongQuery(artist, { refetchOnMountOrArgChange: true });
  const artistTracks = Array.isArray(songsData?.result?.tracks?.data)
    ? songsData.result.tracks.data.filter(
        (song: any) =>
          (song.artist_name === artist || song.extraSearch?.artist?.name === artist) &&
          song.name !== title
      )
    : [];

  const { handleTogglePlay, setupPlayerOnce, handleLike, handleDelete, currentPlayedTrack } =
    usePlayer({
      queue: trackData?.tracks ?? []
    });

  const [isLiked, setIsLiked] = useState(track?.liked);

  useEffect(() => {
    setupPlayerOnce();
  }, [setupPlayerOnce]);

  const openPlaylist = async () => {
    setShowCreate(true);
  };

  const DEFAULT_COVER = `${trackCovers}default.png`;

  const imageSrc = useMemo(() => {
    if (!track) return DEFAULT_COVER;

    if (track.owned) {
      return track.tracks_graphics?.[0]?.cover
        ? `${trackCovers}${track.tracks_graphics[0].cover}`
        : DEFAULT_COVER;
    }

    const thumbnails = track.extraSearch?.thumbnails;

    if (Array.isArray(thumbnails) && thumbnails.length) {
      return [...thumbnails].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;
    }

    if (typeof thumbnails?.url === 'string') {
      return thumbnails.url;
    }

    return track.tracks_graphics?.[0]?.cover
      ? `${trackCovers}${track.tracks_graphics[0].cover}`
      : DEFAULT_COVER;
  }, [track]);

  const vibrantColor = useVibrantColor(imageSrc);

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
    <ScrollView>
      <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
        <View style={{ justifyContent: 'center', alignItems: 'center', width: screenWidth }}>
          <View style={styles.Box}>
            <Animated.View
              style={{
                position: 'absolute',
                width: '300%',
                height: 300,
                transform: [{ rotate: '135deg' }, { translateY }]
              }}>
              <LinearGradient
                colors={[colors.blackGray, vibrantColor, colors.blackGray]}
                style={{ height: 400 }}
              />
              <LinearGradient
                colors={[colors.blackGray, vibrantColor, colors.blackGray]}
                style={{ height: 400 }}
              />
            </Animated.View>
            <View style={[styles.container, { position: 'relative', marginTop: 10 }]}>
              <Shadow
                startColor='#2b2b2b40'
                distance={12}
                offset={[0, 8]}>
                <Image
                  source={{ uri: imageSrc }}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 8
                  }}
                  contentFit='cover'
                  transition={200}
                />
              </Shadow>
            </View>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30, marginLeft: 20 }}>
              <TouchableOpacity onPress={handlePress}>
                <View style={styles.button}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={colors.white}
                    style={{ alignSelf: 'center' }}
                  />
                </View>
              </TouchableOpacity>
              <View style={{ marginLeft: 10, minWidth: 20 }}>
                <View style={styles.title}>
                  <Text
                    style={{
                      letterSpacing: 1,
                      color: colors.white,
                      fontSize: 24,
                      fontWeight: 600
                    }}>
                    {title}
                  </Text>
                </View>
                <View style={styles.buttonTitle}>
                  <Text style={{ letterSpacing: 1, color: colors.lightGray, fontSize: 18 }}>
                    {artist}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <PlaylistUpdate
          showCreate={showCreate}
          setShowCreate={setShowCreate}
          popoverPos={popoverPos}
          track={track}
        />
        <View
          style={{
            flexDirection: 'row',
            width: screenWidth,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
            marginTop: 10
          }}>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              if (isLiked) {
                handleDelete(track?.id_track);
              } else {
                handleLike(track?.id_track);
              }
              dispatch(setTriggerLike(track?.id_track));
            }}>
            <Ionicons
              name='heart'
              size={20}
              color={isLiked ? '#b70000ff' : '#b0b0b0'}
            />
          </Pressable>
          <Pressable
            ref={createBtnRef}
            style={styles.actionButton}
            onPress={openPlaylist}>
            <Ionicons
              name='add-circle-outline'
              size={20}
              color='white'
            />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {}}>
            <Ionicons
              name='ellipsis-vertical'
              size={16}
              color='#b0b0b0'
            />
          </Pressable>
        </View>
        <View style={{ marginTop: 30, marginLeft: 20 }}>
          <Text style={{ fontSize: 16, color: colors.lightGray }}>Popular tracks: </Text>
          <Text style={{ fontSize: 25, marginLeft: 5, fontWeight: 700, color: colors.white }}>
            {artist}
          </Text>
        </View>
        <View
          style={{
            width: screenWidth,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
            minHeight: 400,
            backgroundColor: colors.blackGray
          }}>
          <FlatList
            data={isArtistLoading ? Array.from({ length: 6 }) : artistTracks}
            keyExtractor={(item, index) =>
              isArtistLoading
                ? `skeleton-${index}`
                : item.id_track
                  ? `owned-${item.id_track}`
                  : `search-${item.id_youtube ?? index}`
            }
            contentContainerStyle={{ paddingBottom: 90 }}
            renderItem={({ item, index }) =>
              isArtistLoading ? (
                <TrackSkeleton />
              ) : item.owned ? (
                <MusicBar
                  track={item}
                  index={index}
                  onPlay={async () => {
                    dispatch(setQueue(artistTracks.filter((t: any) => t.owned)));
                    dispatch(setCurrentPlayedTrackId(item.id_track));
                    try {
                      await handleTogglePlay(item);
                    } catch (e) {
                      console.log('Play error:', e);
                    }
                  }}
                />
              ) : (
                <SearchBar
                  track={item}
                  index={index}
                  onPlay={async () => {
                    try {
                      await initializeMedia({ id_youtube: String(item.id_youtube!) });
                    } catch (e) {
                      console.error('Error initializing media:', e);
                    }
                  }}
                />
              )
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
