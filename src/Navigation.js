import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import * as RN from 'react-native';
import Home from './screens/Home';
import Add from './screens/Add';
import HistoryScreen from './screens/HistoryScreen'; 
import StatsScreen from './screens/StatsScreen';

const Stack = createNativeStackNavigator();

function MyStack(){
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={Home} options={{ title: 'Bienvenida', headerShown: false, }} />
            <Stack.Screen name="Add" component={Add} options={{ title: 'Registrar Emoción', headerShown: false, }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Tu Historial', headerShown: false, }} />
            <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas', headerShown: false, }} />
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