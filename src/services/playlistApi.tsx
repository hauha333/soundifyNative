import { API_METHODS, PLAYLIST_API } from '@/utils/constants/api';

import { api } from './api';
import { AuthenticationResponse } from '@/types/auth';
import { GetPlaylistResponse } from '@/types/api/playlist';

export const playlistApi = api.enhanceEndpoints({ addTagTypes: ['Playlist'] }).injectEndpoints({
  endpoints: (build) => ({
    createPlaylist: build.mutation<AuthenticationResponse, { name: string; isPublic: boolean }>({
      query: ({ name, isPublic }) => ({
        url: PLAYLIST_API.PLAYLISTS,
        method: API_METHODS.POST,
        body: {
          name,
          isPublic
        }
      }),
      invalidatesTags: ['Playlist']
    }),
    getMyPlaylists: build.query<GetPlaylistResponse, void>({
      query: () => ({
        url: PLAYLIST_API.PLAYLISTS,
        method: API_METHODS.GET
      }),
      providesTags: ['Playlist']
    }),
    getMyPlaylistTracks: build.query<any, number>({
      query: (id_playlist) => ({
        url: PLAYLIST_API.TRACKS.replace(':idPlaylist', id_playlist.toString()),
        method: API_METHODS.GET
      })
    }),
    addTrack: build.mutation<AuthenticationResponse, { id_playlist: number; id_track: number }>({
      query: ({ id_playlist, id_track }) => ({
        url: PLAYLIST_API.TRACKS.replace(':idPlaylist', id_playlist.toString()),
        method: API_METHODS.POST,
        params: {
          id_track: id_track
        }
      })
    }),
    deleteTrack: build.mutation<AuthenticationResponse, { id_playlist: number; id_track: number }>({
      query: ({ id_playlist, id_track }) => ({
        url: PLAYLIST_API.TRACKS.replace(':idPlaylist', id_playlist.toString()),
        method: API_METHODS.DELETE,
        params: {
          id_track: id_track
        }
      })
    }),
    deletePlaylist: build.mutation<void, { id_playlist: number }>({
      query: ({ id_playlist }) => ({
        url: PLAYLIST_API.DELETE.replace(':playlist_id', id_playlist.toString()),
        method: API_METHODS.DELETE
      }),
      invalidatesTags: ['Playlist']
    })
  })
});

export const {
  useCreatePlaylistMutation,
  useGetMyPlaylistsQuery,
  useGetMyPlaylistTracksQuery,
  useAddTrackMutation,
  useDeleteTrackMutation,
  useDeletePlaylistMutation
} = playlistApi;
