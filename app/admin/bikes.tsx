import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, Portal, Modal, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AdminService } from '../../services/admin.service';
import { formatCurrency } from '../../utils/formatters';
import { Bike, Plus, Search, MapPin, Trash2, Edit3, X, Filter, ChevronRight, Settings2 } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function AdminBikes() {
  const [bikes, setBikes] = useState<any[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  
  const [newCode, setNewCode] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [stations, setStations] = useState<any[]>([]);
  const [editingBikeId, setEditingBikeId] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllBikes();
      const stationData = await AdminService.getAllStations();
      setBikes(data);
      setFilteredBikes(data);
      setStations(stationData);
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query) {
      setFilteredBikes(bikes);
      return;
    }
    const filtered = bikes.filter(b => 
      b.code?.toLowerCase().includes(query.toLowerCase()) ||
      b.station?.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBikes(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'booked': return COLORS.info;
      case 'in_use': return COLORS.info;
      case 'maintenance': return COLORS.warning;
      default: return COLORS.textMuted;
    }
  };

  const updateStatus = async (bikeId: string, status: string) => {
    try {
      await AdminService.updateBikeStatus(bikeId, status);
      fetchBikes();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateStatus = (bikeId: string, currentStatus: string) => {
    Alert.alert('Update Status', 'Set new status for this bike', [
      { text: 'Available', onPress: () => updateStatus(bikeId, 'available') },
      { text: 'Booked / In Use', onPress: () => updateStatus(bikeId, 'booked') },
      { text: 'Maintenance', onPress: () => updateStatus(bikeId, 'maintenance') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleEditBike = (bike: any) => {
    setEditingBikeId(bike.id);
    setNewCode(bike.code);
    setNewPrice(bike.price_per_minute.toString());
    setNewImageUrl(bike.image_url || '');
    setSelectedStation(bike.station_id);
    setVisible(true);
  };

  const handleSaveBike = async () => {
    if (!newCode || !selectedStation || !newPrice) {
      Alert.alert('Incomplete Data', 'Please provide all required bike information.');
      return;
    }
    try {
      if (editingBikeId) {
        await AdminService.updateBike(editingBikeId, {
          code: newCode,
          station_id: selectedStation,
          price_per_minute: parseFloat(newPrice),
          image_url: newImageUrl
        });
      } else {
        await AdminService.addBike(newCode, selectedStation, parseFloat(newPrice), newImageUrl);
      }
      setVisible(false);
      resetForm();
      fetchBikes();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const resetForm = () => {
    setNewCode('');
    setNewPrice('');
    setNewImageUrl('');
    setSelectedStation('');
    setEditingBikeId(null);
  };

  const handleDeleteBike = (bikeId: string) => {
    Alert.alert('Remove Bike', 'Are you sure you want to remove this bike from the fleet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await AdminService.deleteBike(bikeId);
          fetchBikes();
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      }}
    ]);
  };

  const renderBike = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=500' }} 
          style={styles.bikeImage}
        />
        <View style={styles.bikeInfo}>
          <View style={styles.bikeHeader}>
            <Text style={styles.bikeCode}>{item.code}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={12} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{item.station?.name || 'Assigned Station'}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>RENTAL RATE</Text>
            <Text style={styles.priceValue}>{formatCurrency(item.price_per_minute)}<Text style={styles.priceUnit}> / min</Text></Text>
          </View>
        </View>

        <View style={styles.actionsColumn}>
          <TouchableOpacity style={styles.actionCircle} onPress={() => handleEditBike(item)}>
            <Edit3 size={16} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCircle, { backgroundColor: COLORS.warning + '10' }]} onPress={() => handleUpdateStatus(item.id, item.status)}>
            <Settings2 size={16} color={COLORS.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCircle, { backgroundColor: COLORS.error + '10' }]} onPress={() => handleDeleteBike(item.id)}>
            <Trash2 size={16} color={COLORS.error} />
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
          <Text style={styles.headerTitle}>Fleet Inventory</Text>
          <TouchableOpacity style={styles.plusBtn} onPress={() => setVisible(true)}>
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search code or station..."
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
            data={filteredBikes}
            keyExtractor={(item) => item.id}
            renderItem={renderBike}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBikes(); }} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Bike size={64} color={COLORS.border} strokeWidth={1} />
                <Text style={styles.emptyText}>No units in inventory.</Text>
              </View>
            }
          />
        )}

        <Portal>
          <Modal visible={visible} onDismiss={() => { setVisible(false); resetForm(); }} contentContainerStyle={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBikeId ? 'Update Unit' : 'New Inventory Unit'}</Text>
              <TouchableOpacity onPress={() => { setVisible(false); resetForm(); }}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.inputLabel}>Unit Configuration</Text>
              <View style={styles.templateGrid}>
                {[
                  { name: 'Yamaha YBR', code: 'YAM', price: '150' },
                  { name: 'TVS HLX', code: 'TVS', price: '120' },
                  { name: 'Boxer BMX', code: 'BOX', price: '180' },
                  { name: 'Keeway', code: 'KEE', price: '140' },
                ].map(model => (
                  <TouchableOpacity 
                    key={model.name} 
                    style={styles.templateChip}
                    onPress={() => {
                      setNewCode(model.code + '-' + Math.floor(100 + Math.random() * 900));
                      setNewPrice(model.price);
                    }}
                  >
                    <Text style={styles.templateChipText}>{model.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Asset Code</Text>
                <TextInput
                  placeholder="e.g. OK-SB-01"
                  value={newCode}
                  onChangeText={setNewCode}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Price per Minute (FCFA)</Text>
                <TextInput
                  placeholder="e.g. 50"
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Image Asset URL</Text>
                <TextInput
                  placeholder="Paste URL here..."
                  value={newImageUrl}
                  onChangeText={setNewImageUrl}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              </View>
              
              <Text style={styles.inputLabel}>Assignment Station</Text>
              <View style={styles.stationGrid}>
                {stations.map(s => (
                  <TouchableOpacity 
                    key={s.id} 
                    style={[
                      styles.stationChip, 
                      selectedStation === s.id && styles.stationChipSelected
                    ]}
                    onPress={() => setSelectedStation(s.id)}
                  >
                    <Text style={[
                      styles.stationChipText,
                      selectedStation === s.id && styles.stationChipTextSelected
                    ]}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveBike}>
                <Text style={styles.submitBtnText}>{editingBikeId ? 'Save Configuration' : 'Register New Unit'}</Text>
              </TouchableOpacity>
            </ScrollView>
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
  plusBtn: {
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
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  bikeImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  bikeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bikeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bikeCode: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  priceUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: 'normal',
  },
  actionsColumn: {
    gap: 8,
    paddingLeft: 8,
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.white,
    padding: 24,
    margin: 20,
    borderRadius: 28,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  templateChipText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  stationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  stationChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stationChipSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  stationChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stationChipTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 120,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
