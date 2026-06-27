import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// ===== ÉCRANS AUTH =====
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// ===== ÉCRANS PRINCIPAUX =====
import HomeScreen from '../screens/home/HomeScreen';
import MovieDetailScreen from '../screens/movie/MovieDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ===== NAVIGATION AUTH =====
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// ===== NAVIGATION ONGLETS =====
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#333',
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      tabBarActiveTintColor: '#E50914',
      tabBarInactiveTintColor: '#888',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Accueil',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
      }}
    />
    <Tab.Screen
      name="Payment"
      component={PaymentScreen}
      options={{
        tabBarLabel: 'Abonnement',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💳</Text>,
      }}
    />
  </Tab.Navigator>
);

// ===== NAVIGATION PRINCIPALE =====
const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
  </Stack.Navigator>
);

// ===== NAVIGATION GLOBALE =====
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;