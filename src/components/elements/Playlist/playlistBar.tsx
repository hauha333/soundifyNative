import { useDeletePlaylistMutation } from '@/services/playlistApi';
import Constants from 'expo-constants';
import React, { useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
// @ts-ignore
import Ripple from 'react-native-material-ripple';
import { Ionicons } from '@expo/vector-icons';
import Popover from 'react-native-popover-view';
import { router } from 'expo-router';

const { playlistCovers } = Constants.expoConfig?.extra ?? {};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 12,
    alignItems: 'center'
  },
  editText: {
    color: '#fff',
    fontWeight: '600'
  },
  deleteButton: {
    borderColor: 'red'
  },
  deleteText: {
    color: 'red',
    fontWeight: '600'
  }
});

const PlaylistBar = ({ playlist }: any) => {
  const [isVisible, setIsVisible] = useState(false);

  const playlistName = playlist?.name ? playlist?.name : playlist?.playlist?.name;
  const playlistOwnerName = playlist?.owner?.name
    ? playlist?.owner?.name
    : playlist?.playlist?.owner?.name;
  const playlistCover_url = playlist?.cover_url
    ? playlist?.cover_url
    : playlist?.playlist?.cover_url;

  const imageStyle = { width: 55, height: 55, borderRadius: 3 };

  const [handleDelete] = useDeletePlaylistMutation();

  return (
    <View key={playlist?.id_users_playlists}>
      <Ripple
        rippleColor='rgba(255,255,255,0.4)'
        rippleDuration={600}
        rippleContainerBorderRadius={5}
        style={{
          padding: 8,
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row'
        }}
        onPress={() => {
          if (playlist?.id_users_playlists === 0) {
            router.push('/home');
          } else {
            router.push({ pathname: `/playlist/` });
            router.push(`/playlist/${playlist?.id_users_playlists}`);
          }
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: 320
          }}>
          {isVisible ? (
            <View
              onStartShouldSetResponder={() => true}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: 320
              }}></View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {playlistCover_url ? (
                <Image
                  source={
                    playlist?.id_users_playlists === 0
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
              <View>
                <Text
                  style={{
                    color: 'white',
                    paddingLeft: 12,
                    fontSize: 18,
                    fontWeight: 600
                  }}>
                  {playlistName}
                </Text>
                <Text
                  style={{
                    color: 'gray',
                    paddingLeft: 12,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                  {playlist.id_users_playlists === 0
                    ? playlistOwnerName
                    : `Playlist ● ${playlistOwnerName}`}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Ripple>

      {isVisible ? (
        <View style={{ flexDirection: 'row', height: 55, justifyContent: 'space-evenly' }}>
          <Pressable onPress={() => setIsVisible(false)}>
            <View
              style={{
                height: 40,
                width: 60,
                justifyContent: 'center',
                borderRadius: 20,
                padding: 8,

                shadowColor: '#9b9b9bff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 10,

                elevation: 12
              }}>
              <Ionicons
                style={{ left: 10 }}
                name='close'
                size={20}
                color='#d0d0d0'
              />
            </View>
          </Pressable>
          <Pressable onPress={() => handleDelete({ id_playlist: playlist.id_users_playlists })}>
            <View
              style={{
                height: 40,
                width: 60,
                justifyContent: 'center',
                borderRadius: 20,
                padding: 8,

                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,

                shadowColor: '#ce0505ff',
                shadowRadius: 12,
                elevation: 14
              }}>
              <Ionicons
                style={{ left: 10 }}
                name='trash'
                size={20}
                color='#ce0505ff'
              />
            </View>
          </Pressable>
        </View>
      ) : (
        <View
          onStartShouldSetResponder={() => true}
          style={{ position: 'absolute', top: 20, right: 8 }}>
          {playlist.id_users_playlists !== 0 && (
            <Popover
              isVisible={isVisible}
              onRequestClose={() => setIsVisible(false)}
              from={
                <Pressable onPress={() => setIsVisible(true)}>
                  <View
                    style={{
                      backgroundColor: '#1a1a1a',
                      borderRadius: 20,
                      padding: 8,
                      elevation: 12
                    }}>
                    <Ionicons
                      name='ellipsis-vertical'
                      size={16}
                      color='#b0b0b0'
                    />
                  </View>
                </Pressable>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

export default PlaylistBar;
