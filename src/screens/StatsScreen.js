import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Platform  } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const { width } = Dimensions.get('window');

  // Función para procesar los datos del almacenamiento local
  const processEntries = (entries) => {
    const emotionsCount = {};
    const weeklyCount = Array(7).fill(0); // Para contar entradas por día de la semana
    let totalEntries = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = null;

    // Ordenar entradas por fecha (más reciente primero)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    sortedEntries.forEach(entry => {
      // Contar emociones (usamos el emoji como clave)
      const emotion = entry.emotion;
      emotionsCount[emotion] = (emotionsCount[emotion] || 0) + 1;

      // Contar por día de la semana (0: Domingo, 6: Sábado)
      const entryDate = new Date(entry.createdAt);
      weeklyCount[entryDate.getDay()]++;
      totalEntries++;

      // Calcular racha (días consecutivos con entradas)
      const currentDateStr = new Date(entry.createdAt).toDateString();
      if (lastDate) {
        const yesterday = new Date(lastDate);
        yesterday.setDate(yesterday.getDate() + 1);
        
        if (currentDateStr === yesterday.toDateString()) {
          currentStreak++;
        } else if (currentDateStr !== lastDate) {
          // Solo reiniciamos si no es el mismo día
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = currentDateStr;
    });

    // Ordenar emociones por frecuencia
    const sortedEmotions = Object.entries(emotionsCount)
      .sort((a, b) => b[1] - a[1])
      .map(([emoji, count]) => ({ 
        emoji,
        name: getEmotionName(emoji), 
        count 
      }));

    return {
      emotions: sortedEmotions,
      entries: weeklyCount.map((count, index) => ({
        day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][index],
        count
      })),
      streak: maxStreak,
      totalEntries,
      lastEntry: sortedEntries[0] 
    };
  };

  // Función para obtener el nombre de la emoción basado en el emoji
  const getEmotionName = (emoji) => {
    const emotionsMap = {
      '😊': 'Feliz',
      '😐': 'Neutral',
      '😔': 'Triste',
      '😡': 'Enojado',
      '😴': 'Cansado',
      '🥳': 'Emocionado'
    };
    return emotionsMap[emoji] || emoji;
  };

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem('wellbeingEntries');
        const entries = savedEntries ? JSON.parse(savedEntries) : [];
        
        if (entries.length > 0) {
          const processedData = processEntries(entries);
          setStats(processedData);
        } else {
          setStats({
            emotions: [],
            entries: Array(7).fill({ day: '', count: 0 }),
            streak: 0,
            totalEntries: 0,
            lastEntry: null
          });
        }
      } catch (error) {
        console.error('Error al leer entradas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchEntries();
    }
  }, [isFocused]);

  const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Tus Estadísticas</Text>
        {stats.lastEntry && (
          <Text style={styles.lastEntryDate}>
            Última entrada: {stats.lastEntry.formattedDate}
          </Text>
        )}
      </View>
      
      {stats.totalEntries > 0 ? (
        <>
          <View style={styles.statsRow}>
            <StatCard title="Racha máxima" value={stats.streak} icon="🔥" />
            <StatCard title="Entradas totales" value={stats.totalEntries} icon="📝" />
          </View>

          {stats.emotions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tus emociones más frecuentes</Text>
              <View style={styles.emotionsList}>
                {stats.emotions.slice(0, 3).map((emotion, index) => (
                  <View key={index} style={styles.emotionBadge}>
                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                    <Text style={styles.emotionName}>{emotion.name}</Text>
                    <Text style={styles.emotionCount}>{emotion.count} veces</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Actividad por día de la semana</Text>
          <BarChart
            data={{
              labels: stats.entries.map(e => e.day),
              datasets: [{
                data: stats.entries.map(e => e.count)
              }]
            }}
            width={width - 40}
            height={200}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f8f8f8',
              backgroundGradientTo: '#f8f8f8',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 111, 165, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForLabels: { fontSize: 10 }
            }}
            style={styles.chart}
            fromZero
          />

          <View style={styles.insightBox}>
            <Ionicons name="analytics" size={24} color="white" />
            <Text style={styles.insightText}>
              {stats.emotions.length > 0 
                ? `Te has sentido ${stats.emotions[0].name.toLowerCase()} más frecuentemente`
                : 'Comienza a registrar tus emociones'}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart" size={50} color="#4a6fa5" />
          <Text style={styles.emptyText}>Aún no tienes entradas registradas</Text>
          <Text style={styles.emptySubtext}>Tus estadísticas aparecerán aquí</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2a2a2a',
    marginBottom: 5,
  },
  lastEntryDate: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a6fa5',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 15,
    marginTop: 20,
  },
  emotionsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emotionBadge: {
    width: '32%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emotionEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  emotionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  emotionCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  insightBox: {
    backgroundColor: '#4a6fa5',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default StatsScreen;