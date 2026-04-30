import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Modal, Image } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, TextInput, Snackbar } from 'react-native-paper';
import { useRides } from '../../hooks/useRides';
import { useWallet } from '../../hooks/useWallet';
import { RideService } from '../../services/ride.service';
import { MapPin, Bike } from 'lucide-react-native';
import { formatCurrency } from '../../utils/formatters';

export default function StationsScreen() {
  const { stations, loading, refreshing, fetchStations, bookRide } = useRides();
  const { wallet } = useWallet();
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [availableBikes, setAvailableBikes] = useState<any[]>([]);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleStationSelect = async (station: any) => {
    setSelectedStation(station);
    setBikesLoading(true);
    try {
      const bikes = await RideService.getAvailableBikes(station.id);
      setAvailableBikes(bikes);
    } catch (e) {
      console.error(e);
    } finally {
      setBikesLoading(false);
    }
  };

  const handleBookPress = (bike: any) => {
    setSelectedBike(bike);
    setDestination('');
    setActivationCode(null);
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!destination) {
      setError('Please enter a destination');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      // Fixed price for prototype: 500 FCFA
      const amount = 500;
      const result: any = await bookRide(selectedBike.id, amount, destination);
      
      if (result && result.success) {
        setActivationCode(result.activation_code);
      }
    } catch (e: any) {
      setError(e.message || 'Booking failed. Check your wallet balance.');
    } finally {
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingModalVisible(false);
    setSelectedBike(null);
    setActivationCode(null);
    if (selectedStation) {
      handleStationSelect(selectedStation); // Refresh bikes
    }
  };

  const renderStation = ({ item }: { item: any }) => (
    <Card 
      style={[
        styles.card, 
        selectedStation?.id === item.id && { borderColor: theme.colors.primary, borderWidth: 2 }
      ]}
      onPress={() => handleStationSelect(item)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MapPin color={selectedStation?.id === item.id ? theme.colors.primary : '#666'} size={24} />
        </View>
        <View style={styles.stationInfo}>
          <Text variant="titleMedium" style={styles.stationName}>{item.name}</Text>
          <Text variant="bodyMedium" style={styles.stationDesc}>{item.location_description}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.half}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Select Station</Text>
        {loading && !refreshing ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={stations}
            keyExtractor={(item) => item.id}
            renderItem={renderStation}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStations} />}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <View style={[styles.half, styles.bikesContainer]}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Available Bikes {selectedStation ? `at ${selectedStation.name}` : ''}
        </Text>
        
        {!selectedStation ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>Select a station to see bikes</Text>
          </View>
        ) : bikesLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : availableBikes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>No bikes available at this station</Text>
          </View>
        ) : (
          <FlatList
            data={availableBikes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.bikeCard}>
                <Card.Content style={styles.bikeCardContent}>
                  <View style={styles.bikeMain}>
                    {item.image_url ? (
                      <Image 
                        source={{ uri: item.image_url }} 
                        style={styles.bikeImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.bikeIconContainer}>
                        <Bike color={theme.colors.primary} size={32} />
                      </View>
                    )}
                    <View style={styles.bikeInfoText}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.code}</Text>
                      <Text variant="bodySmall" style={{ color: '#666' }}>{formatCurrency(item.price_per_minute)}/min</Text>
                    </View>
                  </View>
                  <Button mode="contained" onPress={() => handleBookPress(item)} style={styles.bookButton}>
                    Book
                  </Button>
                </Card.Content>
              </Card>
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!activationCode ? (
              <>
                <Text variant="headlineSmall" style={styles.modalTitle}>Confirm Booking</Text>
                <Text style={{ marginBottom: 16 }}>Bike: <Text style={{ fontWeight: 'bold' }}>{selectedBike?.code}</Text></Text>
                <Text style={{ marginBottom: 16 }}>Price: <Text style={{ fontWeight: 'bold' }}>{formatCurrency(500)}</Text> (Fixed Fare)</Text>
                
                <TextInput
                  label="Destination"
                  value={destination}
                  onChangeText={setDestination}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />

                <Text style={{ color: (wallet?.balance || 0) < 500 ? 'red' : '#666', marginBottom: 24 }}>
                  Your Balance: {formatCurrency(wallet?.balance || 0)}
                  {(wallet?.balance || 0) < 500 && " (Insufficient funds)"}
                </Text>

                {error ? (
                  <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</Text>
                ) : null}

                <View style={styles.modalActions}>
                  <Button mode="outlined" onPress={closeBookingModal} style={{ flex: 1, marginRight: 8 }}>
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleConfirmBooking} 
                    loading={bookingLoading} 
                    disabled={bookingLoading}
                    style={{ flex: 1, marginLeft: 8 }}
                  >
                    Pay & Book
                  </Button>
                </View>
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 8 }}>Success!</Text>
                <Text variant="bodyLarge" style={{ marginBottom: 24, textAlign: 'center' }}>
                  Your ride has been booked. Use this code to unlock the bike:
                </Text>
                <View style={styles.codeBox}>
                  <Text variant="displayMedium" style={styles.codeText}>{activationCode}</Text>
                </View>
                <Text style={{ color: 'red', marginBottom: 24 }}>Expires in 15 minutes</Text>
                <Button mode="contained" onPress={closeBookingModal} style={{ width: '100%' }}>
                  Done
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  half: {
    flex: 1,
    padding: 16,
  },
  bikesContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
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
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  stationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stationName: {
    fontWeight: 'bold',
  },
  stationDesc: {
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  bikeCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  bikeCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  bikeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bikeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  bikeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bikeInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  bookButton: {
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeBox: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  codeText: {
    fontWeight: 'bold',
    letterSpacing: 8,
  },
});
