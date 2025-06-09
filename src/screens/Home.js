import * as React from 'react';
import { View, ImageBackground, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
    const navigation = useNavigation();
    const [weather, setWeather] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Coordenadas de ejemplo
    const latitude = 19.4326;
    const longitude = -99.1332;

    React.useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                );
                const data = await response.json();
                setWeather(data.current_weather);
            } catch (error) {
                console.error("Error fetching weather:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const getWeatherIcon = (weatherCode) => {
        const icons = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️', 51: '🌧️', 53: '🌧️',
            55: '🌧️', 56: '🌧️❄️', 57: '🌧️❄️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            66: '🌧️❄️', 67: '🌧️❄️', 71: '❄️',
            73: '❄️', 75: '❄️', 77: '❄️',
            80: '🌦️', 81: '🌦️', 82: '🌦️',
            85: '❄️', 86: '❄️', 95: '⛈️',
            96: '⛈️', 99: '⛈️'
        };
        return icons[weatherCode] || '🌈';
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{
                    uri: 'https://images.unsplash.com/photo-1747138593244-0922d4f9d649?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>Diario de Bienestar</Text>
                        <Text style={styles.subtitle}>
                            Un espacio para registrar tus emociones, reflexiones y cultivar 
                            una vida más consciente y equilibrada.
                        </Text>

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('Add')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>Nueva Entrada</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate('History')}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.secondaryButtonText}>Mi Historial</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statsButton}
                                onPress={() => navigation.navigate('Stats')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.statsButtonText}>Ver Estadísticas</Text>
                            </TouchableOpacity>
                        </View>

                        {!loading && weather && (
                            <View style={styles.weatherContainer}>
                                <Text style={styles.weatherIcon}>
                                    {getWeatherIcon(weather.weathercode)}
                                </Text>
                                <Text style={styles.weatherText}>
                                    {weather.temperature}°C
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 500,
        padding: 32,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: Platform.OS === 'web' ? 'blur(12px)' : undefined,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonsContainer: {
        marginTop: 24,
    },
    title: {
        fontSize: isSmallDevice ? 28 : 32,
        fontWeight: '700',
        marginBottom: 16,
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: isSmallDevice ? 34 : 38,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: isSmallDevice ? 16 : 18,
        textAlign: 'center',
        marginBottom: 8,
        color: 'rgba(255, 255, 255, 0.95)',
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
        letterSpacing: 0.3,
    },
    primaryButton: {
        backgroundColor: '#5D84A6',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    statsButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    statsButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    weatherContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    weatherIcon: {
        fontSize: 40,
        marginBottom: 4,
    },
    weatherText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '500',
    },
});