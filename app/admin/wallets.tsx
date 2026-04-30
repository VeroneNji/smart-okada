import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AdminService } from '../../services/admin.service';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Wallet, Search, X, ChevronRight, TrendingUp, ArrowUpRight } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function AdminWallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllWallets();
      setWallets(data);
      setFilteredWallets(data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query) {
      setFilteredWallets(wallets);
      return;
    }
    const filtered = wallets.filter(w => 
      w.user?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      w.user?.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredWallets(filtered);
  };

  const renderWallet = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.walletIconContainer}>
          <Wallet size={24} color={COLORS.secondary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.user?.full_name || 'System User'}</Text>
          <Text style={styles.email}>{item.user?.email}</Text>
          <Text style={styles.date}>Updated {formatDate(item.updated_at)}</Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>{formatCurrency(item.balance)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ACTIVE</Text>
          </View>
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
          <Text style={styles.headerTitle}>Finance Control</Text>
          <View style={{ width: 44 }} />
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL USER FUNDS</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(wallets.reduce((acc, w) => acc + (w.balance || 0), 0))}
            </Text>
          </View>
          <ArrowUpRight size={24} color="rgba(255,255,255,0.3)" />
        </View>

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search by name or email..."
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
            data={filteredWallets}
            keyExtractor={(item) => item.id}
            renderItem={renderWallet}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWallets(); }} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Wallet size={48} color={COLORS.border} strokeWidth={1} />
                <Text style={styles.emptyText}>No wallets found.</Text>
              </View>
            }
          />
        )}
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
  summaryCard: {
    backgroundColor: COLORS.secondary,
    margin: SPACING.lg,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  search: {
    elevation: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 0,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  walletIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  email: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.success,
  },
  statusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#16A34A',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.textMuted,
  },
});
