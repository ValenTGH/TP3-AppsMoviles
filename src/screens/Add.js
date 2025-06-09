import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Alert, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Add() {
    const navigation = useNavigation();
    const [newEntry, setNewEntry] = useState({
        date: new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }),
        emotion: '',
        note: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEmotionSelect = (selectedEmotion) => {
        setNewEntry({ ...newEntry, emotion: selectedEmotion });
    };

    const saveEntry = async () => {
        if (!newEntry.emotion) {
            Alert.alert('Emoción requerida', 'Por favor, selecciona cómo te sientes hoy.');
            return;
        }

        if (!newEntry.note.trim()) {
            Alert.alert('Nota requerida', 'Escribe algunas palabras sobre tu día.');
            return;
        }

        setIsSubmitting(true);

        try {
            const entryId = Date.now().toString();
            const entryToSave = {
                ...newEntry,
                id: entryId,
                createdAt: new Date().toISOString(),
                formattedDate: newEntry.date
            };

            const existingEntriesJson = await AsyncStorage.getItem('wellbeingEntries');
            const existingEntries = existingEntriesJson ? JSON.parse(existingEntriesJson) : [];

            await AsyncStorage.setItem(
                'wellbeingEntries',
                JSON.stringify([entryToSave, ...existingEntries])
            );

            Alert.alert('Registro guardado', 'Tu reflexión diaria ha sido guardada.', [
                {
                    text: 'Ver historial',
                    onPress: () => navigation.navigate('History')
                },
                {
                    text: 'Continuar',
                    onPress: () => {
                        setNewEntry(prev => ({
                            ...prev,
                            emotion: '',
                            note: ''
                        }));
                    },
                    style: 'cancel'
                }
            ]);

        } catch (e) {
            console.error('Error al guardar:', e);
            Alert.alert('Error', 'No se pudo guardar tu registro. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const emotions = [
        { emoji: '😊', name: 'Feliz' },
        { emoji: '😐', name: 'Neutral' },
        { emoji: '😔', name: 'Triste' },
        { emoji: '😡', name: 'Enojado' },
        { emoji: '😴', name: 'Cansado' },
        { emoji: '🥳', name: 'Emocionado' }
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.homeButton} 
                        onPress={() => navigation.navigate('Home')} 
                    >
                        <Ionicons name="home" size={28} color="#4a6fa5" />
                    </TouchableOpacity>

                    <Text style={styles.dateText}>{newEntry.date}</Text>

                    <Text style={styles.sectionTitle}>¿Cómo te sientes hoy?</Text>
                    <View style={styles.emotionContainer}>
                        {emotions.map((item) => (
                            <TouchableOpacity
                                key={item.emoji}
                                style={[
                                    styles.emotionButton,
                                    newEntry.emotion === item.emoji && styles.selectedEmotionButton,
                                ]}
                                onPress={() => handleEmotionSelect(item.emoji)}
                            >
                                <Text style={styles.emotionText}>{item.emoji}</Text>
                                <Text style={styles.emotionLabel}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Reflexión del día</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="Escribe sobre tu día, algo por lo que estés agradecido, o cómo te gustaría mejorar..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={6}
                        value={newEntry.note}
                        onChangeText={(text) => setNewEntry({ ...newEntry, note: text })}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isSubmitting && styles.saveButtonDisabled
                        ]}
                        onPress={saveEntry}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Reflexión'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 40,
    },
    homeButton: {
        alignSelf: 'flex-start', 
        padding: 10,
        marginBottom: 10, 
        marginTop: Platform.OS === 'ios' ? 40 : 10, 
    },
    dateText: {
        alignSelf: 'flex-end',
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 30,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#34495e',
        marginBottom: 15,
    },
    emotionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    emotionButton: {
        width: width * 0.28,
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#ecf0f1',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#dfe6e9',
    },
    selectedEmotionButton: {
        backgroundColor: '#d6eaf8',
        borderColor: '#4a6fa5',
    },
    emotionText: {
        fontSize: 32,
        marginBottom: 5,
    },
    emotionLabel: {
        fontSize: 14,
        color: '#2c3e50',
    },
    noteInput: {
        width: '100%',
        minHeight: 150,
        borderColor: '#dfe6e9',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
        backgroundColor: '#fff',
        fontSize: 16,
        lineHeight: 24,
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    saveButton: {
        backgroundColor: '#4a6fa5',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4a6fa5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});