import { router, Stack, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import NavigationHeaderLeft from '@/components/layouts/NavigationHeaderLeft';
import useColorScheme from '@/hooks/useColorScheme';
import { colors } from '@/theme';
import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '@/services/userApi';
import { logout, setSearchQuery } from '@/slices/userSlice';
import { use, useEffect, useState } from 'react';

export default function SearchStackLayout() {
  const navigation = useNavigation();
  const { isDark } = useColorScheme();
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutMutation();

  const { searchQuery } = useSelector((state: any) => state.userStore);
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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

  useEffect(() => {
    setValue(searchQuery);
  }, [searchQuery]);

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
          title: 'Search',
          headerTitle: () => (
            <TextInput
              placeholder='Search...'
              keyboardType='default'
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={(text) => {
                if (isFocused) {
                  dispatch(setSearchQuery(text));
                }
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
