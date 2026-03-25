import { Text, View, StyleSheet, Dimensions } from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import Button from '@/components/elements/Button';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';
import { useDispatch, useSelector } from 'react-redux';
import { useInitializeMediaMutation, useSearchSongQuery } from '@/services/mediaApi';
import SearchBar from '@/components/elements/MusicBar/searchBar';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import MusicBar from '../../components/elements/MusicBar/bar';
import { usePlayer } from '@/hooks/usePlayer';
import { setCurrentPlayedTrackId, setQueue } from '@/slices/playerSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    marginLeft: 25
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    height: 44,
    width: '50%',
    backgroundColor: colors.lightPurple
  }
});

export default function Search() {
  const router = useRouter();
  const { isDark } = useColorScheme();

  const { searchQuery } = useSelector((state: any) => state.userStore);

  const dispatch = useDispatch();

  const { data: searchResult } = useSearchSongQuery(searchQuery, {
    refetchOnMountOrArgChange: true
  });

  const tracksData = searchResult?.result?.tracks?.data || [];

  const [initializeMedia] = useInitializeMediaMutation();

  const { handleTogglePlay } = usePlayer({
    queue: tracksData ?? []
  });

  return (
    <ScrollView style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
      <View style={[isDark && { backgroundColor: colors.blackGray }]}>
        <Text style={[styles.title, isDark && { color: colors.white }]}>Tracks</Text>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <FlatList
            style={{ flex: 1 }}
            data={tracksData}
            keyExtractor={(item, index) =>
              item.id_track ? `owned-${item.id_track}` : `search-${item.id_youtube ?? index}`
            }
            contentContainerStyle={{ paddingBottom: 90 }}
            renderItem={({ item: track, index }) =>
              track.owned ? (
                <MusicBar
                  track={track}
                  index={index}
                  onPlay={async () => {
                    dispatch(setQueue(tracksData.filter((t: any) => t.owned)));
                    dispatch(setCurrentPlayedTrackId(track.id_track));

                    try {
                      await handleTogglePlay(track);
                    } catch (e) {
                      console.log('Play error:', e);
                    }
                  }}
                />
              ) : (
                <SearchBar
                  track={track}
                  index={index}
                  onPlay={async () => {
                    try {
                      await initializeMedia({
                        id_youtube: String(track.id_youtube!)
                      });
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

// <Button
//   key={track.id}
//   style={styles.button}
//   onPress={() => router.push(`/player/${track.id}`)}>
//   <Text style={styles.buttonTitle}>
//     {index + 1}. {track.title}
//   </Text>
// </Button>
