import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    Platform,
    Alert, 
    Modal,
    TextInput
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
    const navigation = useNavigation();
    const [wellbeingEntries, setWellbeingEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editedNote, setEditedNote] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [entryToDeleteId, setEntryToDeleteId] = useState(null);

    const loadEntries = async () => {
        try {
            setRefreshing(true);
            const jsonValue = await AsyncStorage.getItem('wellbeingEntries');
            const loadedEntries = jsonValue ? JSON.parse(jsonValue) : [];
            loadedEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setWellbeingEntries(loadedEntries);
        } catch (e) {
            console.error("Error loading entries: ", e);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadEntries();
            return () => {};
        }, [])
    );

    const formatDate = (dateString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const renderEmotionIcon = (emotion) => {
        const emojiMap = {
            'Feliz': '😊',
            'Neutral': '😐',
            'Triste': '😔',
            'Enojado': '😡',
            'Cansado': '😴',
            'Emocionado': '🥳'
        };

        return Object.entries(emojiMap).find(([key]) =>
            emotion.includes(key) || key.includes(emotion)
        )?.[1] || emotion;
    };

    const confirmDelete = (id) => {
        setEntryToDeleteId(id);
        setDeleteModalVisible(true);
    };

    const deleteEntry = async () => {
        try {
            const updatedEntries = wellbeingEntries.filter(entry => entry.id !== entryToDeleteId);
            await AsyncStorage.setItem('wellbeingEntries', JSON.stringify(updatedEntries));
            setWellbeingEntries(updatedEntries);
            setDeleteModalVisible(false);
            setEntryToDeleteId(null);
            Alert.alert("Éxito", "El registro ha sido eliminado."); // Alerta simple de éxito
        } catch (e) {
            console.error("Error deleting entry: ", e);
            Alert.alert("Error", "No se pudo eliminar el registro");
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setEditedNote(entry.note);
    };

    const saveEditedEntry = async () => {
        if (!editedNote.trim()) {
            Alert.alert("Error", "La nota no puede estar vacía");
            return;
        }

        try {
            const updatedEntries = wellbeingEntries.map(entry =>
                entry.id === editingEntry.id
                    ? { ...entry, note: editedNote }
                    : entry
            );

            await AsyncStorage.setItem('wellbeingEntries', JSON.stringify(updatedEntries));
            setWellbeingEntries(updatedEntries);
            setEditingEntry(null);
            Alert.alert("Éxito", "El registro ha sido actualizado."); 
        } catch (e) {
            console.error("Error updating entry: ", e);
            Alert.alert("Error", "No se pudo actualizar el registro");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="home" size={28} color="#4a6fa5" />
                </TouchableOpacity>
                <Text style={styles.title}>Tu Diario Emocional</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('Add')}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {wellbeingEntries.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="journal-outline" size={60} color="#a8dadc" />
                    <Text style={styles.emptyText}>No hay registros todavía</Text>
                    <Text style={styles.emptySubtext}>Presiona el botón + para comenzar</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Add')}
                    >
                        <Text style={styles.primaryButtonText}>Crear Primer Registro</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wellbeingEntries}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={loadEntries}
                            tintColor="#457b9d"
                        />
                    }
                    renderItem={({ item }) => (
                        <View style={styles.entryCard}>
                            <View style={styles.entryHeader}>
                                <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
                                <Text style={styles.entryEmotion}>
                                    {renderEmotionIcon(item.emotion)}
                                </Text>
                            </View>
                            <Text style={styles.entryNote}>{item.note}</Text>

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(item)}
                                >
                                    <Ionicons name="pencil" size={20} color="#4a6fa5" />
                                    <Text style={styles.editButtonText}>Editar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => confirmDelete(item.id)}
                                >
                                    <Ionicons name="trash" size={20} color="#e63946" />
                                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListHeaderComponent={
                        <Text style={styles.resultsText}>
                            {wellbeingEntries.length} registros encontrados
                        </Text>
                    }
                />
            )}

            {/* Modal para editar */}
            <Modal
                visible={!!editingEntry}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditingEntry(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Registro</Text>

                        <Text style={styles.modalEmotion}>
                            {editingEntry && renderEmotionIcon(editingEntry.emotion)}
                        </Text>

                        <Text style={styles.modalDate}>
                            {editingEntry && formatDate(editingEntry.createdAt)}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            multiline
                            numberOfLines={4}
                            value={editedNote}
                            onChangeText={setEditedNote}
                            placeholder="Edita tu reflexión..."
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setEditingEntry(null)}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={saveEditedEntry}
                            >
                                <Text style={styles.modalSaveText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal
                visible={deleteModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Ionicons name="warning-outline" size={50} color="#e63946" style={styles.modalIcon} />
                        <Text style={styles.modalTitle}>¿Eliminar Registro?</Text>
                        <Text style={styles.modalMessage}>Esta acción no se puede deshacer.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSaveButton, styles.deleteConfirmButton]}
                                onPress={deleteEntry}
                            >
                                <Text style={styles.modalSaveText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 35, 
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2c3e50',
        marginTop:50,
    },
    addButton: {
        backgroundColor: '#4a6fa5',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4a6fa5',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginTop:50,
    },
    homeButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:50,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#457b9d',
        marginTop: 20,
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 30,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#4a6fa5',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    resultsText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 15,
        textAlign: 'right',
    },
    entryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    entryDate: {
        fontSize: 14,
        color: '#7f8c8d',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    },
    entryEmotion: {
        fontSize: 28,
    },
    entryNote: {
        fontSize: 16,
        color: '#2c3e50',
        lineHeight: 24,
        marginBottom: 15,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(74, 111, 165, 0.1)',
    },
    editButtonText: {
        color: '#4a6fa5',
        marginLeft: 5,
        fontWeight: '500',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(230, 57, 70, 0.1)',
    },
    deleteButtonText: {
        color: '#e63946',
        marginLeft: 5,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center', // Centra el contenido del modal
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalEmotion: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 5,
    },
    modalDate: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalInput: {
        width: '100%',
        minHeight: 120,
        borderColor: '#dfe6e9',
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    modalCancelButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#f1f1f1',
    },
    modalCancelText: {
        color: '#2c3e50',
        fontWeight: '500',
    },
    modalSaveButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#4a6fa5',
    },
    modalSaveText: {
        color: '#fff',
        fontWeight: '500',
    },
    modalIcon: {
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 20,
    },
    deleteConfirmButton: {
        backgroundColor: '#e63946', 
});