import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { RootState } from '@/utils/store';

import Constants from 'expo-constants';
import { logout, setAccessToken, setRefreshToken } from '@/slices/userSlice';
import { GetLikedTracksResponse } from '@/types/api/userTracks';
import { userApi } from './userApi';
import { API_METHODS, REFRESH_API } from '@utils/constants/api';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

interface RefreshResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).userStore.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    return headers;
  },

  responseHandler: async (response) => {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      console.warn('⚠️ Non-JSON response:', text.slice(0, 100));
      return {};
    }
  }
});

const baseQueryNoAuth = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: 'include'
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await baseQueryNoAuth(
          {
            url: REFRESH_API.REFRESH,
            method: API_METHODS.GET
          },
          api,
          extraOptions
        );

        const data = refreshResult.data as RefreshResponse;

        if (data?.tokens?.accessToken) {
          api.dispatch(setAccessToken(data.tokens.accessToken));
          api.dispatch(setRefreshToken(data.tokens.refreshToken));

          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SearchSong', 'LikedTracks'],
  endpoints: () => ({})
});
