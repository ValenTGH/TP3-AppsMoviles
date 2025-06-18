import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import * as RN from 'react-native';
import Home from './screens/Home';
import Add from './screens/Add';
import HistoryScreen from './screens/HistoryScreen'; 
import StatsScreen from './screens/StatsScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

function MyStack() {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Add" component={Add} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />

        </Stack.Navigator>
    );
}
export default function Navigation() {
    return (
        <NavigationContainer>
            <MyStack/>
        </NavigationContainer>
    );
}