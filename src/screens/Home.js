import * as React from 'react';
import { View, ImageBackground, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
    const navigation = useNavigation();
    const [quote, setQuote] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const response = await fetch('https://gist.githubusercontent.com/ValenTGH/04ac146d3ecc9a9162236e72aa803668/raw');
                const data = await response.text();
                const quotes = JSON.parse(data);
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                setQuote(`${randomQuote.text} \n- ${randomQuote.author}`);
            } catch (error) {
                console.error("Error fetching quotes:", error);
                setQuote("La vida es un 10% lo que nos pasa y un 90% cómo reaccionamos."); // Fallback quote
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    const { width, height } = Dimensions.get('window');
    const isSmallDevice = width < 375;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            position: 'relative',
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
            maxWidth: 600,
            padding: 16,
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
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 16,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 28,
            fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
            letterSpacing: 0.5,
            width: '100%',
        },
        subtitle: {
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 8,
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: 24,
            fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
            letterSpacing: 0.3,
        },
        primaryButton: {
            backgroundColor: '#000000',
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
            backgroundColor: '#000000',
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
            backgroundColor: '#000000',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        statsButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.3,
        },
        quoteContainer: {
            marginTop: 20,
            alignItems: 'center',
        },
        quoteText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '500',
            textAlign: 'center',
        },
        card: {
            padding: 20,
            margin: 10,
            backgroundColor: '#f0f0f0',
            borderRadius: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
        },
    });

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{
                    uri: 'https://media.istockphoto.com/id/2148659111/es/vector/dark-blue-light-color-wavy-gradient-with-rough-abstract-background-shine-bright-light-and.jpg?s=612x612&w=0&k=20&c=aLlDFZfD8hLLGaAbLy-KQ5D_RT24YgCLV2knuNwi3Ug=',
                }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <View style={styles.contentContainer}>
                        <Text style={[styles.title, { width: '100%' }]}>Tu Diario de Bienestar</Text>
                        <Text style={styles.subtitle}>
                            Un rincón para acompañarte a expresar lo que sentís, reflexionar con calma y cuidar de vos con cariño, cada día.
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

                        {!loading && quote && (
                            <View style={styles.quoteContainer}>
                                <Text style={styles.quoteText}>
                                    {quote}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}