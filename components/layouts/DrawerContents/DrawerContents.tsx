import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { useGetMyPlaylistsQuery } from '@/services/playlistApi';
import PlaylistBar from '@/components/elements/Playlist/playlistBar';
import { FollowedPlaylist, Playlist } from '@/types/playlist';
import { useGetLikedTracksQuery } from '@/services/userApi';
const LikedTracks = require('@/assets/images/LikedTracks.jpg');

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  }
});

export default function DrawerContents() {
  const { isDark } = useColorScheme();
  const { data: playlists } = useGetMyPlaylistsQuery(undefined, {
    refetchOnMountOrArgChange: false
  });

  const { data: likedTracks } = useGetLikedTracksQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const playlistsNormaized = Array.isArray(playlists?.playlists)
    ? playlists.playlists
    : Array.isArray(playlists)
      ? playlists
      : [];

  const playlistsWithLiked = [
    ...playlistsNormaized,
    {
      id_users_playlists: 0,
      path: '/home',
      name: 'Liked Tracks',
      owner: {
        name: `Playlist ● ${likedTracks?.tracks.length}`
      },
      cover_url: LikedTracks,
      hash: ''
    }
  ];

  return (
    <SafeAreaView>
      <View style={{ marginBlock: 18, paddingLeft: 34 }}>
        <Text style={{ color: 'white', fontSize: 26, fontWeight: 600 }}>My playlists</Text>
      </View>
      <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
        {[...playlistsWithLiked].reverse()?.map((playlist: Playlist | FollowedPlaylist) => (
          <PlaylistBar
            key={playlist.id_users_playlists}
            playlist={playlist}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
