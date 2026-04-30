import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, IconButton, useTheme, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AdminService } from '../../services/admin.service';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

export default function AdminRides() {
  const [rides, setRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const router = useRouter();

  const fetchRides = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllRides();
      setRides(data);
      setFilteredRides(data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query) {
      setFilteredRides(rides);
      return;
    }
    const filtered = rides.filter(r => 
      r.user?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      r.bike?.code?.toLowerCase().includes(query.toLowerCase()) ||
      r.destination?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRides(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'active': return '#2196f3';
      case 'pending': return '#ff9800';
      default: return '#757575';
    }
  };

  const renderRide = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.rideHeader}>
          <View>
            <Text variant="titleMedium" style={styles.userName}>{item.user?.full_name || 'System User'}</Text>
            <Text variant="bodySmall" style={styles.subtext}>{item.user?.email}</Text>
          </View>
          <Chip 
            textStyle={{ color: '#fff' }} 
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <View style={styles.divider} />
        <View style={styles.rideDetails}>
          <Text variant="bodyMedium"><Text style={{ fontWeight: 'bold' }}>Bike:</Text> {item.bike?.code}</Text>
          <Text variant="bodyMedium"><Text style={{ fontWeight: 'bold' }}>To:</Text> {item.destination}</Text>
          <Text variant="bodySmall" style={styles.date}>{formatDate(item.created_at)} • {formatTime(item.created_at)}</Text>
        </View>
        <View style={styles.rideFooter}>
          <Text variant="titleLarge" style={styles.price}>{formatCurrency(item.price)}</Text>
          <IconButton icon="eye" size={20} onPress={() => {}} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="titleLarge" style={styles.title}>Ride Records</Text>
      </View>
      
      <Searchbar
        placeholder="Search by user, bike, or destination..."
        onChangeText={handleSearch}
        value={search}
        style={styles.search}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredRides}
          keyExtractor={(item) => item.id}
          renderItem={renderRide}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRides(); }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No rides found.</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
  },
  search: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userName: {
    fontWeight: 'bold',
  },
  subtext: {
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  rideDetails: {
    marginBottom: 12,
  },
  date: {
    color: '#999',
    marginTop: 4,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  }
});
