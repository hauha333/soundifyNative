import { Track } from '@/types/track';
import { Text, View, Dimensions, Image, Pressable, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import Button from '../Button';
import { usePlayer } from '@/hooks/usePlayer';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '@/functions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/store';
import { useEffect, useRef, useState } from 'react';
import { setTriggerLike } from '@/slices/playerSlice';
import PlaylistUpdate from '@/components/modals/PlaylistUpdate';
import { PAGES } from '@/utils/constants/pages';
import { router, usePathname } from 'expo-router';

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
  },
  trackName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    flexShrink: 1
  },
  trackNameCurrent: {
    color: '#ac0fd4'
  }
});

const { trackCovers } = Constants.expoConfig?.extra ?? {};

const MusicBar = ({ index, track, onPlay }: Props) => {
  const screenWidth = Dimensions.get('window').width;
  const [showCreate, setShowCreate] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const createBtnRef = useRef<View | null>(null);

  const path = usePathname();

  const {
    currentPlayedTrackId,
    triggerLikeTrackId: triggerLike,
    isShuffle
  } = useSelector((state: RootState) => state.playerStore);

  const trackData = btoa(JSON.stringify(track?.id_youtube));

  const isCurrent = track?.id_track === currentPlayedTrackId;

  const { handleLike, handleDelete, handleShuffle } = usePlayer();

  const [isLiked, setIsLiked] = useState(track?.liked);

  const dispatch = useDispatch();

  const openPlaylist = async () => {
    setShowCreate(true);
  };

  useEffect(() => {
    if (triggerLike !== track?.id_track) return;

    setIsLiked(!isLiked);

    dispatch(setTriggerLike(null));
  }, [triggerLike]);

  return (
    <Pressable
      style={{
        width: screenWidth - 30,
        height: 70,
        borderRadius: 10,
        backgroundColor: '#212121',
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 5,
        marginVertical: 7,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      onPress={() => {
        if (isShuffle) {
          handleShuffle(track, true);
        }
        onPlay();
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            display: path === '/home' ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            width: 40
          }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{index + 1}</Text>
        </View>

        <Image
          source={{ uri: `${trackCovers}${track?.tracks_graphics?.[0]?.cover ?? 'default.png'}` }}
          style={{
            width: 40,
            height: 40,
            marginLeft: path === '/home' ? 0 : 15,
            borderRadius: 5,
            marginHorizontal: 5
          }}
        />
        <View
          style={{ maxWidth: isCurrent ? screenWidth - 280 : screenWidth - 160, marginLeft: 5 }}>
          <Text
            numberOfLines={1}
            onPress={(e) => {
              e.stopPropagation();
              router.push(PAGES.TRACK.replace(':track', trackData));
            }}
            style={[styles.trackName, isCurrent && styles.trackNameCurrent]}>
            {track?.name}
          </Text>
          <Text
            style={{
              color: '#b0b0b0',
              fontSize: 11,
              overflow: 'hidden'
            }}>
            {track.artist_name}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        <PlaylistUpdate
          showCreate={showCreate}
          setShowCreate={setShowCreate}
          popoverPos={popoverPos}
          track={track}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 8,
            display: isCurrent ? 'flex' : 'none'
          }}>
          <Pressable
            style={{ marginInline: 12 }}
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
            style={{ marginInline: 12 }}
            onPress={openPlaylist}>
            <Ionicons
              name='add-circle-outline'
              size={20}
              color='white'
            />
          </Pressable>
          <Pressable
            style={{ marginInline: 12 }}
            onPress={() => {}}>
            <Ionicons
              name='ellipsis-vertical'
              size={16}
              color='#b0b0b0'
            />
          </Pressable>
        </View>
        <View>
          <Text style={{ color: '#ffffffff', fontSize: 12 }}>
            {formatTime(Math.floor(+track.duration * 1000))}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default MusicBar;
