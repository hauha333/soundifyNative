import { Fragment, useState, useEffect, use } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import BottomSheetContents from '@/components/layouts/BottomSheetContents';
import BottomSheet from '@/components/elements/BottomSheet';
import { useDataPersist, DataPersistKeys } from '@/hooks';
import useColorScheme from '@/hooks/useColorScheme';
import { loadImages, loadFonts, colors } from '@/theme';
import { router, Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppSlice } from '@/slices';
import Provider from '@/providers';
import { User } from '@/types';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getUserAsync } from '@/services';
import BottomPlayer from '@/components/layouts/Player';
import TrackPlayer from 'react-native-track-player';
import { View } from 'react-native-reanimated/lib/typescript/Animated';
import { Provider as PaperProvider } from 'react-native-paper';
SplashScreen.preventAutoHideAsync();

function Router() {
  const { dispatch, setUser, setIsAuthenticated } = useAppSlice();
  const { setPersistData, getPersistData } = useDataPersist();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false
          }
        }
      })
  );
  /**
   * preload assets and user info
   */
  useEffect(() => {
    (async () => {
      try {
        // preload assets
        await Promise.all([loadImages(), loadFonts()]);

        // fetch & store user data to store (fake promise function to simulate async function)
        const user = await getUserAsync();
        dispatch(setUser(user));
        dispatch(setIsAuthenticated(!!user));
        if (user) setPersistData<User>(DataPersistKeys.USER, user);

        // hide splash screen
        SplashScreen.hideAsync();
      } catch {
        // if preload failed, try to get user data from persistent storage
        getPersistData<User>(DataPersistKeys.USER)
          .then((user) => {
            if (user) dispatch(setUser(user));
            dispatch(setIsAuthenticated(!!user));
          })
          .finally(() => {
            // hide splash screen
            SplashScreen.hideAsync();

            // show bottom sheet
          });
      }
    })();
  }, []);

  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>

      <StatusBar style='light' />
    </Fragment>
  );
}

export default function RootLayout() {
  const path = usePathname();
  useEffect(() => {
    if (path?.includes('notification.click')) {
      router.replace('/home');
    }
  }, [path]);
  return (
    <Provider>
      <PaperProvider>
        <Router />
      </PaperProvider>
    </Provider>
  );
}
