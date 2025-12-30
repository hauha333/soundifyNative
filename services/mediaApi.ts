import { API_METHODS, PLAYER_API } from '@/utils/constants/api';

import { api } from './api';

export const mediaApi = api.enhanceEndpoints({ addTagTypes: ['SearchSong'] }).injectEndpoints({
  endpoints: (build) => ({
    initializeMedia: build.mutation<any, { id_youtube: string }>({
      query: ({ id_youtube }) => ({
        url: PLAYER_API.MEDIAINITIALIZE,
        method: API_METHODS.POST,
        params: {
          wait: true
        },
        body: { id_youtube }
      }),
      invalidatesTags: ['SearchSong']
    }),
    searchSong: build.query<any, string>({
      query: (searchValue: string) => ({
        url: PLAYER_API.SEARCH,
        method: API_METHODS.GET,
        params: {
          q: searchValue,
          type: 'tracks',
          extraSearch: true
        }
      }),
      providesTags: ['SearchSong']
    })
  })
});

export const { useInitializeMediaMutation, useSearchSongQuery } = mediaApi;
