import { useGetMyPlaylistTracksQuery } from '@/services/playlistApi';
import Constants from 'expo-constants';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
interface PlaylistItemProps {
  playlist: number;
  trackId: number;
  item: any;
  playlistToAdded: number[];
  setPlaylistToAdded: (value: number[]) => void;
  playlistToDelete: number[];
  setPlaylistToDelete: (value: number[]) => void;
}

const { playlistCovers } = Constants.expoConfig?.extra ?? {};

const imageStyle = { width: 45, height: 45, borderRadius: 3 };

const PlaylistItem: React.FC<PlaylistItemProps> = ({
  playlist,
  trackId,
  item,
  playlistToAdded,
  setPlaylistToAdded,
  playlistToDelete,
  setPlaylistToDelete
}) => {
  const { data: tracksData, isSuccess } = useGetMyPlaylistTracksQuery(playlist, {
    skip: !playlist
  });

  const isInPlaylist = isSuccess && tracksData?.tracks?.some((t: any) => t.id_track === trackId);

  const playlistData = item.type === 'playlist_follow' ? item.playlist : item;
  const id = playlistData.id_users_playlists;

  const isChecked = (() => {
    if (playlistToAdded.includes(id)) return true;
    if (playlistToDelete.includes(id)) return false;
    return isInPlaylist;
  })();

  const playlistCover_url = item?.cover_url ? item?.cover_url : item?.playlist?.cover_url;

  const handleClick = () => {
    if (isChecked) {
      if (isInPlaylist) setPlaylistToDelete([...playlistToDelete.filter((el) => el !== id), id]);
      setPlaylistToAdded(playlistToAdded.filter((el) => el !== id));
    } else {
      if (!isInPlaylist) setPlaylistToAdded([...playlistToAdded.filter((el) => el !== id), id]);
      setPlaylistToDelete(playlistToDelete.filter((el) => el !== id));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleClick}
      style={styles.container}>
      <View style={styles.left}>
        {playlistCover_url ? (
          <Image
            source={
              item?.id_users_playlists === 0
                ? playlistCover_url
                : { uri: `${playlistCovers}${playlistCover_url}` }
            }
            style={imageStyle}
          />
        ) : (
          <View
            style={{
              ...imageStyle,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#242424'
            }}>
            <Svg
              width={25}
              height={25}
              viewBox='0 0 20 24'>
              <Path
                d='M9 3v10.56A4 4 0 1 0 11 17V7h6V3H9z'
                fill='#888'
              />
            </Svg>
          </View>
        )}
        <Text style={styles.name}>{playlistData.name}</Text>
      </View>

      <TouchableOpacity
        onPress={handleClick}
        activeOpacity={0.7}
        style={styles.radioButton}>
        <View style={styles.radioOuter}>
          <View style={[styles.radioInner, isChecked && styles.radioChecked]} />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default PlaylistItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: '#1e1e1e'
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 12
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 12,
    backgroundColor: '#242423',
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: {
    color: 'white',
    fontSize: 16
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgb(206, 147, 216);',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  radioChecked: {
    backgroundColor: 'rgb(206, 147, 216);',
    borderRadius: 12
  },
  radioLabel: {
    color: 'white',
    fontSize: 14
  }
});
