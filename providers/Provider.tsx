import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import useColorScheme from '@/hooks/useColorScheme';
import store, { persistor } from '@/utils/store';
import 'react-native-reanimated';
import { PersistGate } from 'redux-persist/integration/react';
export default function Provider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isDark } = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>{children}</ThemeProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
