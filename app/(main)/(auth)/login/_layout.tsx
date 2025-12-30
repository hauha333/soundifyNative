import { Stack } from 'expo-router';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';

export default function LoginStackLayout() {
  const { isDark } = useColorScheme();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.white,
        headerStyle: { backgroundColor: isDark ? colors.blackGray : colors.darkPurple },
        headerTitleStyle: { fontSize: 18 }
      }}>
      <Stack.Screen
        name='index'
        options={{
          title: '123',
          headerTitle: () => null,
          headerTitleAlign: 'center'
        }}
      />
    </Stack>
  );
}
