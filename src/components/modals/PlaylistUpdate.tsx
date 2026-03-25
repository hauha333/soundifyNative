import {
  useAddTrackMutation,
  useDeleteTrackMutation,
  useGetMyPlaylistsQuery
} from '@/services/playlistApi';
import { Track } from '@/types/track';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid
} from 'react-native';
import PlaylistItem from '../UI/Playlistitem';
import { Portal } from 'react-native-paper';

interface PlaylistUpdateProps {
  showCreate: boolean;
  setShowCreate: (val: boolean) => void;
  popoverPos?: { top: number; left: number };
  track: Track;
}

const { width, height } = Dimensions.get('window');

const PlaylistUpdate: React.FC<PlaylistUpdateProps> = ({ showCreate, setShowCreate, track }) => {
  const { data: playlistsData } = useGetMyPlaylistsQuery(undefined, {
    refetchOnMountOrArgChange: false
  });

  const playlistArray = playlistsData?.playlists ?? [];

  const [value, setValue] = useState('');
  const [playlistToAdded, setPlaylistToAdded] = useState<number[]>([]);
  const [playlistToDelete, setPlaylistToDelete] = useState<number[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<any[]>([]);

  const [addTrack] = useAddTrackMutation();
  const [deleteTrack] = useDeleteTrackMutation();

  useEffect(() => {
    const query = (value || '').trim().toLowerCase();

    const filtered = [...playlistArray].reverse().filter((p: any) => {
      const name = p?.name ?? '';
      return name.toLowerCase().includes(query);
    });

    setFilteredTracks(filtered);
  }, [value, playlistArray]);

  const handleAddToAllPlaylists = async () => {
    setShowCreate(false);
    try {
      await Promise.all(
        playlistToAdded.map((id) =>
          addTrack({ id_playlist: id, id_track: track.id_track }).unwrap()
        )
      );
      ToastAndroid.show('Track added to all selected playlists!', ToastAndroid.SHORT);
    } catch {
      ToastAndroid.show('Failed to add track to some playlists', ToastAndroid.SHORT);
    }
  };

  const handleDeleteToAllPlaylists = async () => {
    setShowCreate(false);
    try {
      await Promise.all(
        playlistToDelete.map((id) =>
          deleteTrack({ id_playlist: id, id_track: track.id_track }).unwrap()
        )
      );
      ToastAndroid.show('Track removed from selected playlists!', ToastAndroid.SHORT);
    } catch {
      ToastAndroid.show('Failed to remove track from some playlists', ToastAndroid.SHORT);
    }
  };

  if (!showCreate) return null;

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <TouchableOpacity
          style={styles.background}
          activeOpacity={1}
          onPress={() => setShowCreate(false)}
        />
        <View style={styles.modal}>
          <Text style={styles.title}>Update playlist</Text>
          <TextInput
            placeholder={'Search playlists...'}
            placeholderTextColor='#aaa'
            value={value}
            onChangeText={setValue}
            style={styles.input}
          />
          <ScrollView style={styles.list}>
            {filteredTracks.map((item: any) => (
              <PlaylistItem
                key={item.id_users_playlists}
                playlist={item.id_users_playlists}
                trackId={track.id_track}
                item={item}
                playlistToAdded={playlistToAdded}
                setPlaylistToAdded={setPlaylistToAdded}
                playlistToDelete={playlistToDelete}
                setPlaylistToDelete={setPlaylistToDelete}
              />
            ))}
          </ScrollView>
          <View style={styles.footer}>
            {(playlistToAdded.length || playlistToDelete.length) > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  if (playlistToAdded.length) handleAddToAllPlaylists();
                  if (playlistToDelete.length) handleDeleteToAllPlaylists();
                }}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {playlistToAdded.length + playlistToDelete.length > 1
                    ? 'Update playlists'
                    : 'Update playlist'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setShowCreate(false)}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Portal>
  );
};

export default PlaylistUpdate;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000',
    opacity: 0.6
  },
  modal: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 20,
    zIndex: 1001
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4
  },
  input: {
    backgroundColor: '#2c2c2c',
    color: 'white',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 12
  },
  list: {
    flexGrow: 0,
    maxHeight: 250,
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  primaryButton: {
    backgroundColor: '#ac0fd4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});
