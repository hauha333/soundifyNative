import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import NavigationHeaderLeft from '@/components/layouts/NavigationHeaderLeft';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { TextInput } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout, setSearchQuery } from '@/slices/userSlice';
import { useLogoutMutation } from '@/services/userApi';
import { useState } from 'react';
import { test } from '@jest/globals';

export default function PlaylistStackLayout() {
  const [value, setValue] = useState('');
  const navigation = useNavigation();

  const { isDark } = useColorScheme();
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      router.replace('/login');
    }
  };

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.white,
        headerStyle: { backgroundColor: isDark ? colors.blackGray : colors.darkPurple },
        headerTitleStyle: { fontSize: 18 }
      }}>
      <Stack.Screen
        name='[id]'
        options={{
          title: 'Playlist',
          headerTitle: () => (
            <TextInput
              value={value}
              placeholder='Search...'
              onChangeText={(text) => {
                setValue(text);
                dispatch(setSearchQuery(text));
              }}
              onBlur={() => {
                if (value.length === 0) return;
                router.replace('/search');
                setValue('');
              }}
              style={{
                width: 200,
                height: 35,
                backgroundColor: '#3d3d3d75',
                borderRadius: 8,
                paddingHorizontal: 10,
                color: 'white'
              }}
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                handleLogout();
              }}
              style={{
                width: 35,
                height: 35,
                backgroundColor: '#3d3d3d75',
                borderRadius: 6,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10
              }}>
              <Ionicons
                name='settings-outline'
                size={20}
                color='white'
              />
            </TouchableOpacity>
          ),

          headerLeft: () => <NavigationHeaderLeft onPress={toggleDrawer} />,
          headerTitleAlign: 'center'
        }}
      />
      <Stack.Screen
        name='details'
        options={{ title: 'Details' }}
      />
    </Stack>
  );
}
