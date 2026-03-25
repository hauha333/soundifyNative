import axios from 'axios';
import { API_METHODS, USER_API, HEADERS } from '@/utils/constants/api';
import { GetLikedTracksResponse } from '@/types/api/userTracks';
import { GetMeResponse } from '@/types/api/user';
import { store } from '@/utils/store';
import { inflate } from 'pako';

const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://soundify.one/api/v1/',
  headers: { ...HEADERS },
  transformResponse: [
    (data) => {
      try {
        if (typeof data === 'object' && data !== null) {
          console.log('✅ Data already parsed:', data);
          return data;
        }

        if (typeof data === 'string') {
          console.log('📝 Parsing string data');
          return JSON.parse(data);
        }

        const uint8Array = new Uint8Array(data);

        try {
          const text = new TextDecoder('utf-8').decode(uint8Array);
          console.log('🛠 Decoded text (no compression):', text);
          return JSON.parse(text);
        } catch {
          const decompressed = inflate(uint8Array);
          const text = new TextDecoder('utf-8').decode(decompressed);
          return text;
        }
      } catch (er) {
        console.error('Error transforming response:', er);
        return data;
      }
    }
  ]
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.userStore.accessToken;

    console.log('🔍 [REQUEST]', {
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method,
      hasToken: !!accessToken,
      tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'NO TOKEN'
    });

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('⚠️ No access token found in store!');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    let data = response.data;

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {}
    }

    console.log('✅ [RESPONSE]', {
      url: response.config.url,
      status: response.status,
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      data
    });

    return { ...response, data };
  },
  (error) => {
    console.error('❌ [API ERROR]', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('🚨 Unauthorized - token might be invalid or expired');
    }

    return Promise.reject(error);
  }
);

export const userApi = {
  logout: async (): Promise<void> => {
    console.log('🚪 [API] Logging out...');
    const response = await axiosInstance({
      url: USER_API.LOGOUT,
      method: API_METHODS.POST
    });
    return response.data;
  },

  getLikedTracks: async (): Promise<GetLikedTracksResponse> => {
    const response = await axiosInstance({
      url: USER_API.LIKED_TRACKS,
      method: API_METHODS.GET
    });

    let tracksData = response.data;
    if (typeof tracksData === 'string') {
      try {
        tracksData = tracksData;
      } catch {
        tracksData = [];
      }
    }

    console.log('🎵 [API] Liked tracks result:', {
      count: tracksData?.length || 0,
      isEmpty: !tracksData || tracksData.length === 0
    });

    return tracksData;
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await axiosInstance({
      url: USER_API.ME,
      method: API_METHODS.GET
    });
    return response.data;
  },

  setLikedTracks: async (idTrack: number): Promise<void> => {
    const response = await axiosInstance({
      url: USER_API.LIKE_TRACK.replace(':idTrack', idTrack.toString()),
      method: API_METHODS.PUT
    });
    return response.data;
  },

  deleteLikedTrack: async (idTrack: number): Promise<void> => {
    const response = await axiosInstance({
      url: USER_API.LIKE_TRACK.replace(':idTrack', idTrack.toString()),
      method: API_METHODS.DELETE
    });
    return response.data;
  }
};
