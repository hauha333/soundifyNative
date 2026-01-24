import { Drawer } from 'expo-router/drawer';
import DrawerContents from '@/components/layouts/DrawerContents';
import { MenuProvider } from 'react-native-popup-menu';

export default function DrawerWithTabsLayout() {
  return (
    <MenuProvider>
      <Drawer
        drawerContent={DrawerContents}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          swipeEnabled: true,
          swipeEdgeWidth: 150,
          drawerItemStyle: {
            alignItems: 'flex-start'
          },
          drawerLabelStyle: {
            textAlign: 'left'
          }
        }}>
        <Drawer.Screen
          name='(tabs)'
          options={{ title: 'Tabs' }}
        />
      </Drawer>
    </MenuProvider>
  );
}
