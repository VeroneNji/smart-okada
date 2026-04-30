import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, IconButton, useTheme, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AdminService } from '../../services/admin.service';
import { MapPin, Plus, Search, X, Edit3, Trash2, Bike, Navigation } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function AdminStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [filteredStations, setFilteredStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllStations();
      setStations(data);
      setFilteredStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query) {
      setFilteredStations(stations);
      return;
    }
    const filtered = stations.filter(s => 
      s.name?.toLowerCase().includes(query.toLowerCase()) ||
      s.location_description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStations(filtered);
  };

  const handleEditStation = (station: any) => {
    setEditingStationId(station.id);
    setNewName(station.name);
    setNewLoc(station.location_description);
    setVisible(true);
  };

  const handleSaveStation = async () => {
    if (!newName || !newLoc) return;
    try {
      if (editingStationId) {
        await AdminService.updateStation(editingStationId, newName, newLoc);
      } else {
        await AdminService.addStation(newName, newLoc);
      }
      setVisible(false);
      resetForm();
      fetchStations();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteStation = (stationId: string) => {
    Alert.alert('Remove Station', 'Are you sure? This will fail if there are bikes assigned to this station.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await AdminService.deleteStation(stationId);
          fetchStations();
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      }}
    ]);
  };

  const resetForm = () => {
    setNewName('');
    setNewLoc('');
    setEditingStationId(null);
  };

  const renderStation = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MapPin size={24} color={COLORS.primary} />
        </View>
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{item.name}</Text>
          <Text style={styles.stationLoc}>{item.location_description}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Bike size={12} color={COLORS.secondary} />
              <Text style={styles.badgeText}>{item.bikes?.length || 0} units</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditStation(item)}>
            <Edit3 size={18} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.errorLight }]} onPress={() => handleDeleteStation(item.id)}>
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <X size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stations</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setVisible(true)}>
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search stations..."
            onChangeText={handleSearch}
            value={search}
            style={styles.search}
            icon={() => <Search size={20} color={COLORS.textMuted} />}
          />
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredStations}
            keyExtractor={(item) => item.id}
            renderItem={renderStation}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStations(); }} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MapPin size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>No stations found.</Text>
              </View>
            }
          />
        )}

        <Portal>
          <Modal visible={visible} onDismiss={() => { setVisible(false); resetForm(); }} contentContainerStyle={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingStationId ? 'Edit Station' : 'New Station'}</Text>
              <TouchableOpacity onPress={() => { setVisible(false); resetForm(); }}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Station Name</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                placeholder="e.g. Bastos Square"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Location Description</Text>
              <TextInput
                value={newLoc}
                onChangeText={setNewLoc}
                mode="outlined"
                style={[styles.input, { height: 100 }]}
                multiline
                numberOfLines={3}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                placeholder="e.g. Near the French Embassy entrance"
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveStation}>
              <Text style={styles.submitBtnText}>{editingStationId ? 'Save Changes' : 'Create Station'}</Text>
            </TouchableOpacity>
          </Modal>
        </Portal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  addBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  search: {
    elevation: 0,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  list: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  stationLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.white,
    padding: 24,
    margin: 20,
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.textMuted,
  },
});
