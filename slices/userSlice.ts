import { authenticationApi } from '@/services';
import { State } from '@/utils/store';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

interface User {
  id?: string;
  email?: string;
  name?: string;
}

export interface UserState {
  checked: boolean;
  isAuthenticated: boolean;
  user?: User;
  accessToken: string | null;
  refreshToken: string | null;
  searchQuery: string;
}

const initialState: UserState = {
  checked: false,
  isAuthenticated: false,
  user: undefined,
  accessToken: null,
  refreshToken: null,
  searchQuery: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsAuthenticated: (state, { payload }: PayloadAction<boolean>) => {
      state.checked = true;
      state.isAuthenticated = payload;
    },
    setUser: (state, { payload }: PayloadAction<User | undefined>) => {
      state.user = payload;
    },
    setAccessToken: (state, { payload }: PayloadAction<string>) => {
      state.accessToken = payload;
    },
    setRefreshToken: (state, { payload }: PayloadAction<string>) => {
      state.refreshToken = payload;
    },
    setSearchQuery: (state, { payload }: PayloadAction<string>) => {
      state.searchQuery = payload;
    },
    setCredentials: (
      state,
      { payload }: PayloadAction<{ accessToken: string; refreshToken: string; user?: User }>
    ) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.isAuthenticated = true;
      state.checked = true;
      if (payload.user) {
        state.user = payload.user;
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = undefined;
      state.isAuthenticated = false;
      state.checked = true;
    },
    reset: () => initialState
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authenticationApi.endpoints.authentication.matchFulfilled,
      (state, action) => {
        const { accessToken, refreshToken } = action.payload.tokens;
        state.isAuthenticated = true;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
      }
    );
  }
});

export const {
  setIsAuthenticated,
  setUser,
  setAccessToken,
  setRefreshToken,
  setSearchQuery,
  setCredentials,
  logout,
  reset
} = userSlice.actions;

export function useAppSlice() {
  const dispatch = useDispatch<Dispatch>();
  const state = useSelector(({ userStore }: State) => userStore);
  return { dispatch, ...state, ...userSlice.actions };
}

export default userSlice.reducer;
