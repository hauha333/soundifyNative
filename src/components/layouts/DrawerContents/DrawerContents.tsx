import { StyleSheet, View, Text, ToastAndroid, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { useCreatePlaylistMutation, useGetMyPlaylistsQuery } from '@/services/playlistApi';
import PlaylistBar from '@/components/elements/Playlist/playlistBar';
import { FollowedPlaylist, Playlist } from '@/types/playlist';
import { useGetLikedTracksQuery } from '@/services/userApi';
import Ripple from 'react-native-material-ripple';
import { useState } from 'react';
import { Switch, TextInput } from 'react-native-gesture-handler';

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
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [createPlaylist] = useCreatePlaylistMutation();
  const { data: playlists } = useGetMyPlaylistsQuery(undefined, {
    refetchOnMountOrArgChange: false
  });

  const { data: likedTracks } = useGetLikedTracksQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const handleCreate = async () => {
    try {
      await createPlaylist({ name: value, isPublic: isPublic }).unwrap();
      ToastAndroid.show('Playlist created', ToastAndroid.SHORT);
    } catch (err) {
      console.log(err);

      ToastAndroid.show('Failed to create playlist', ToastAndroid.SHORT);
    }
  };
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
        name: `Playlist ● ${likedTracks?.tracks.length} tracks`
      },
      cover_url: LikedTracks,
      hash: ''
    }
  ];

  return (
    <SafeAreaView>
      <View
        style={{
          marginBlock: 18,
          paddingLeft: 34,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
        <Text style={{ color: 'white', fontSize: 26, fontWeight: 600 }}>My playlists</Text>
        <Ripple
          onPress={() => setIsOpen(!isOpen)}
          style={{
            width: 35,
            height: 35,
            borderRadius: 25,
            marginRight: 20,
            placeholder: 'Create Playlist',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#292929'
          }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 600, top: 0, right: 0 }}>+</Text>
        </Ripple>
      </View>
      {isOpen && (
        <View
          style={{
            marginBottom: 18,
            paddingLeft: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <TextInput
            value={value}
            placeholder='Playlist Name...'
            onChangeText={(text) => {
              setValue(text);
            }}
            style={{
              width: 160,
              height: 35,
              backgroundColor: '#3d3d3d75',
              borderRadius: 8,
              paddingHorizontal: 10,
              color: 'white'
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#3a3a3a', true: '#863fb5' }}
              thumbColor={isPublic ? '#ffffff' : '#f4f3f4'}
            />
            <Text style={{ color: 'white' }}>Make public</Text>
          </View>
          <Ripple
            onPress={() => {
              setIsOpen(false);
              setValue('');
            }}
            style={{
              width: 35,
              height: 35,
              borderRadius: 5,
              marginRight: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#863fb5'
            }}>
            <Text
              onPress={() => {
                handleCreate();
              }}
              style={{ color: 'white', fontSize: 16, fontWeight: 600, top: 0, right: 0 }}>
              ✓
            </Text>
          </Ripple>
        </View>
      )}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 65 }}>
        <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
          {[...playlistsWithLiked].reverse()?.map((playlist: Playlist | FollowedPlaylist) => (
            <PlaylistBar
              key={playlist.id_users_playlists}
              playlist={playlist}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
