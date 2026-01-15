import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import MusicBar from '@/components/elements/MusicBar/bar';
import { usePlayer } from '@/hooks/usePlayer';
import { setCurrentPlayedTrackId, setQueue } from '@/slices/playerSlice';
import { useDispatch } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { useGetMyPlaylistsQuery, useGetMyPlaylistTracksQuery } from '@/services/playlistApi';
import { useLocalSearchParams } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center'
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
  title: {
    fontSize: 24,
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
  }
});

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

  return (
    <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
      <FlatList
        data={tracksData?.tracks ?? []}
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
            <View style={styles.Box}>
              <Text style={{ fontSize: 20, color: 'white' }}>Playlist</Text>
              <Text style={{ fontSize: 34, color: 'white' }}>
                {playlist?.name || playlist?.playlist?.name}
              </Text>
              <Text style={{ fontSize: 16, color: 'white' }}>
                {tracksData?.tracks?.length ?? 0} tracks
              </Text>
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
