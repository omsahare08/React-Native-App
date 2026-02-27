import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/Home/Login';
import Signup from './src/Home/Signup';
import Home from './src/Home';
import Screen from './src/Home/Screen';
import AddFiles from './src/Home/AddFiles';
import Qrcode from './src/Home/Qrcode';
import Barcode from './src/Home/Barcode';
import Chart from './src/Home/Chart';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        {/* Auth */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Main */}
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="Screen"
          component={Screen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AddFiles"
          component={AddFiles}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Qrcode"
          component={Qrcode}
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Barcode"
          component={Barcode}
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Chart"
          component={Chart}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;