import { API_METHODS, PLAYER_API, USER_API } from '@/utils/constants/api';

import { api } from './api';

import { GetLikedTracksResponse } from '@/types/api/userTracks';

import { GetMeResponse } from '@/types/api/user';

export const userApi = api.enhanceEndpoints({ addTagTypes: ['LikedTracks'] }).injectEndpoints({
  endpoints: (build) => ({
    logout: build.mutation<void, void>({
      query: () => ({
        url: USER_API.LOGOUT,
        method: API_METHODS.POST
      })
    }),
    getLikedTracks: build.query<GetLikedTracksResponse, void>({
      query: () => ({
        url: USER_API.LIKED_TRACKS,
        method: API_METHODS.GET
      }),
      providesTags: ['LikedTracks']
    }),
    getMe: build.query<GetMeResponse, void>({
      query: () => ({
        url: USER_API.ME,
        method: API_METHODS.GET
      })
    }),
    setLikedTracks: build.mutation<void, { idTrack: number }>({
      query: ({ idTrack }) => ({
        url: USER_API.LIKE_TRACK.replace(':idTrack', idTrack.toString()),
        method: API_METHODS.PUT
      }),
      invalidatesTags: ['LikedTracks']
    }),
    deleteLikedTrack: build.mutation<void, { idTrack: number }>({
      query: ({ idTrack }) => ({
        url: USER_API.LIKE_TRACK.replace(':idTrack', idTrack.toString()),
        method: API_METHODS.DELETE
      })
    })
  })
});

export const {
  useLogoutMutation,
  useGetMeQuery,
  useGetLikedTracksQuery,
  useSetLikedTracksMutation,
  useDeleteLikedTrackMutation
} = userApi;
