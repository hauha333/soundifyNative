import {
  Dimensions,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { usePlayer } from '@/hooks/usePlayer';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/store';
import { useEffect, useState } from 'react';
import { set } from 'react-hook-form';
import { setTriggerLike } from '@/slices/playerSlice';

const { trackCovers } = Constants.expoConfig?.extra ?? {};

const HEIGHT = 64;

const BottomPlayer = () => {
  const { currentPlayedTrack, handleTogglePlay } = usePlayer();
  const screenWidth = Dimensions.get('window').width;

  const { isPlay, triggerLikeTrackId: triggerLike } = useSelector(
    (state: RootState) => state.playerStore
  );
  const { handlePrev, handleNext, handleLike, handleDelete } = usePlayer();

  const [isLiked, setIsLiked] = useState<boolean | undefined>(undefined);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLiked(currentPlayedTrack?.liked);
  }, [currentPlayedTrack?.liked]);

  //pick correctly like quert bc when track is deleterd from liked list show like true

  useEffect(() => {
    if (triggerLike !== currentPlayedTrack?.id_track) return;

    setIsLiked(!isLiked);

    dispatch(setTriggerLike(null));
  }, [triggerLike]);

  if (!currentPlayedTrack) return null;

  return (
    <View style={styles.timeSplit}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Pressable
          onPress={handlePrev}
          style={{ padding: 10 }}>
          <Ionicons
            name='play-skip-back'
            size={28}
            color='#fff'
          />
        </Pressable>
        <Pressable
          onPress={handleNext}
          style={{ padding: 10 }}>
          <Ionicons
            name='play-skip-forward'
            size={28}
            color='#fff'
          />
        </Pressable>
      </View>
      <View style={styles.container}>
        <View style={styles.info}>
          <Image
            source={{
              uri: `${trackCovers}${currentPlayedTrack.tracks_graphics?.[0]?.cover ?? 'default.png'}`
            }}
            style={styles.cover}
          />

          <View style={{ maxWidth: screenWidth - 140 }}>
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
        </View>
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
    </View>
  );
};

export default BottomPlayer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    height: HEIGHT,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#222'
  },
  timeSplit: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: HEIGHT,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#222'
  },

  info: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderColor: '#222'
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10
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
  }
});
