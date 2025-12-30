import { Tabs } from 'expo-router';
import useColorScheme from '@/hooks/useColorScheme';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useAppSlice } from '@/slices';

export default function TabLayout() {
  const { isDark } = useColorScheme();
  const { isAuthenticated } = useAppSlice();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: colors.gray,
        tabBarInactiveBackgroundColor: isDark ? colors.blackGray : colors.white,
        tabBarActiveTintColor: colors.lightPurple,
        tabBarActiveBackgroundColor: isDark ? colors.blackGray : colors.white
      }}>
      <Tabs.Screen
        name='index'
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name='login'
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          href: isAuthenticated ? 'home' : null,
          tabBarIcon: ({ color }) => (
            <AntDesign
              name='home'
              size={24}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          href: isAuthenticated ? 'profile' : null,
          tabBarIcon: ({ color }) => (
            <AntDesign
              name='profile'
              size={24}
              color={color}
            />
          )
        }}
      />
    </Tabs>
  );
}
