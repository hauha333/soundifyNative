import { Track } from '@/types/track';
import { Text, View, Dimensions, Image, Pressable, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Button from '../Button';
import { usePlayer } from '@/hooks/usePlayer';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '@/functions';
import { useDeleteLikedTrackMutation, useSetLikedTracksMutation } from '@/services/userApi';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store';

interface Props {
  index: number;
  track: Track;
  onPlay: () => void;
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }]
  }
});

const SearchBar = ({ index, track, onPlay }: Props) => {
  const screenWidth = Dimensions.get('window').width;
  const { currentPlayedTrackId } = useSelector((state: RootState) => state.playerStore);

  const isCurrent = track?.id_track === currentPlayedTrackId;

  return (
    <Pressable
      style={{
        width: screenWidth - 30,
        height: 70,
        borderRadius: 10,
        backgroundColor: '#161616ff',
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 5,
        marginVertical: 7,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      onPress={() => onPlay()}>
      <View style={{ flexDirection: 'row', opacity: 0.3, alignItems: 'center', marginLeft: 10 }}>
        <Image
          source={{
            uri: `${track?.extraSearch?.thumbnails?.url ?? 'default.png'}`
          }}
          style={{ width: 40, height: 40, borderRadius: 5, marginHorizontal: 5 }}
        />
        <View
          style={{ maxWidth: isCurrent ? screenWidth - 280 : screenWidth - 160, marginLeft: 5 }}>
          <Text
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 14
            }}>
            {track?.extraSearch.name}
          </Text>
          <Text
            style={{
              color: '#b0b0b0',
              fontSize: 11,
              overflow: 'hidden'
            }}>
            {track?.extraSearch.artist.name}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        <View style={{ marginRight: 8 }}>
          <Button style={{ marginInline: 12 }}>
            <Text style={{ color: 'rgba(157, 157, 157, 1)' }}>L</Text>
          </Button>
        </View>
        <View>
          <Text style={{ color: '#b0b0b0', fontSize: 12 }}>
            {formatTime(Math.floor(track?.extraSearch.duration * 1000))}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default SearchBar;
