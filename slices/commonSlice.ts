import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlayDestination = null | string;

interface InitialState {
  isGlobalLoading: boolean;
}

export const initialState: InitialState = {
  isGlobalLoading: false
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setIsGlobalLoading: (state, action: PayloadAction<InitialState['isGlobalLoading']>) => {
      state.isGlobalLoading = action.payload;
    }
  }
});

export const { setIsGlobalLoading } = commonSlice.actions;

export default commonSlice.reducer;
