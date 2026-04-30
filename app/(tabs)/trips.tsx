import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useRides } from '../../hooks/useRides';
import { MapPin, Clock, Bike, History, CheckCircle2 } from 'lucide-react-native';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

export default function TripsScreen() {
  const { history, stations, loading, refreshing, refreshHistory, endRide } = useRides();
  const theme = useTheme();

  const handleEndRide = async (rideId: string) => {
    try {
      // For the prototype, we assume they end at the first available station
      // In production, this would use GPS to find the nearest station
      const endStationId = stations[0]?.id; 
      if (!endStationId) throw new Error("No station found to end ride");
      
      const distance = Math.floor(Math.random() * 5) + 1; // Simulated distance 1-5km
      await endRide(rideId, endStationId, distance);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const renderTrip = ({ item }: { item: any }) => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {formatDate(item.created_at)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#e8f5e9' : '#fff3e0' }]}>
              <Text style={{ color: item.status === 'completed' ? '#4caf50' : '#ff9800', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' }}>
                {item.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <MapPin color={theme.colors.primary} size={16} />
              <Text variant="bodyMedium" style={styles.routeText}>
                {item.start_station?.name || 'Unknown Station'}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <MapPin color={theme.colors.secondary} size={16} />
              <Text variant="bodyMedium" style={styles.routeText}>
                {item.destination}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Bike color="#666" size={16} />
              <Text variant="bodySmall" style={{ marginLeft: 6, color: '#666' }}>{item.bike?.code}</Text>
            </View>
            <View style={styles.footerItem}>
              <Clock color="#666" size={16} />
              <Text variant="bodySmall" style={{ marginLeft: 6, color: '#666' }}>
                {formatTime(item.created_at)}
              </Text>
            </View>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              {formatCurrency(item.price)}
            </Text>
          </View>
          
          {item.status === 'active' && (
            <Button 
              mode="contained" 
              onPress={() => handleEndRide(item.id)}
              style={{ marginTop: 12 }}
              icon={() => <CheckCircle2 color="#fff" size={18} />}
            >
              End Ride
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing && history.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderTrip}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshHistory} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <History color="#ccc" size={64} style={{ marginBottom: 16 }} />
              <Text variant="titleMedium" style={{ color: '#666' }}>No trips yet</Text>
              <Text variant="bodyMedium" style={{ color: '#999', marginTop: 8 }}>
                Your completed and active rides will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginLeft: 7,
    marginVertical: 4,
  },
  routeText: {
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
