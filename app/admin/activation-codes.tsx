import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, IconButton, useTheme, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AdminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

export default function AdminActivationCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const router = useRouter();

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllActivationCodes();
      setCodes(data);
      setFilteredCodes(data);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query) {
      setFilteredCodes(codes);
      return;
    }
    const filtered = codes.filter(c => 
      c.code?.toLowerCase().includes(query.toLowerCase()) ||
      c.ride?.user?.full_name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCodes(filtered);
  };

  const renderCode = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.codeInfo}>
          <Text variant="headlineSmall" style={styles.code}>{item.code}</Text>
          <Text variant="bodySmall" style={styles.subtext}>User: {item.ride?.user?.full_name || 'N/A'}</Text>
          <Text variant="bodySmall" style={styles.subtext}>Bike: {item.ride?.bike?.code || 'N/A'}</Text>
          <Text variant="bodySmall" style={styles.date}>Expires: {formatDate(item.expires_at)}</Text>
        </View>
        <Chip 
          textStyle={{ color: '#fff' }} 
          style={{ backgroundColor: item.is_used ? '#757575' : '#4caf50' }}
        >
          {item.is_used ? 'USED' : 'ACTIVE'}
        </Chip>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="titleLarge" style={styles.title}>Activation Codes</Text>
      </View>
      
      <Searchbar
        placeholder="Search codes or users..."
        onChangeText={handleSearch}
        value={search}
        style={styles.search}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredCodes}
          keyExtractor={(item) => item.id}
          renderItem={renderCode}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCodes(); }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No codes found.</Text>
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInfo: {
    flex: 1,
  },
  code: {
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#1E3A8A',
  },
  subtext: {
    color: '#666',
  },
  date: {
    color: '#999',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  }
});
