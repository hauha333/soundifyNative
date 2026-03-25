import { api } from '@/services/api';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userSlice from '@/slices/userSlice';
import playerSlice from './../slices/playerSlice';
import commonSlice from '@/slices/commonSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['userStore', 'playerStore', 'commonStore']
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  userStore: persistReducer({ key: 'user', storage: AsyncStorage }, userSlice),
  playerStore: persistReducer(
    { key: 'player', storage: AsyncStorage, blacklist: ['isPlay', 'isLiked'] },
    playerSlice
  ),
  commonStore: persistReducer({ key: 'common', storage: AsyncStorage }, commonSlice)
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }).concat(api.middleware)
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
