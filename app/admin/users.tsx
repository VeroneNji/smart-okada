import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, IconButton, useTheme, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AdminService } from '../../services/admin.service';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, X, Shield, ShieldCheck, Trash2, Mail, Phone, Calendar } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId: string) => {
    Alert.alert('Delete User', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await AdminService.deleteUser(userId);
          fetchUsers();
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      }}
    ]);
  };

  const handleToggleAdmin = (userId: string, newState: boolean) => {
    Alert.alert(newState ? 'Promote to Admin' : 'Revoke Admin', 'Change permissions for this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        try {
          await AdminService.toggleAdmin(userId, newState);
          fetchUsers();
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      }}
    ]);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(u => 
      u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.phone?.includes(query)
    );
    setFilteredUsers(filtered);
  };

  const renderUser = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Avatar.Text 
          size={56} 
          label={item.full_name?.substring(0, 2).toUpperCase() || '??'} 
          style={{ backgroundColor: item.is_admin ? COLORS.secondary : COLORS.primary }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.full_name}</Text>
            {item.is_admin && (
              <View style={styles.adminBadge}>
                <ShieldCheck size={10} color={COLORS.secondary} />
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Mail size={12} color={COLORS.textMuted} />
            <Text style={styles.subtext}>{item.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Calendar size={12} color={COLORS.textMuted} />
            <Text style={styles.dateText}>Joined {formatDate(item.created_at)}</Text>
          </View>
        </View>

        <View style={styles.walletSection}>
          <Text style={styles.balance}>{formatCurrency(item.wallets?.[0]?.balance || 0)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionBtn, item.is_admin && { backgroundColor: COLORS.secondary + '10' }]} 
              onPress={() => handleToggleAdmin(item.id, !item.is_admin)}
            >
              <Shield size={18} color={item.is_admin ? COLORS.secondary : COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.errorLight }]} onPress={() => handleDeleteUser(item.id)}>
              <Trash2 size={18} color={COLORS.error} />
            </TouchableOpacity>
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
          <Text style={styles.headerTitle}>User Directory</Text>
          <View style={{ width: 44 }} />
        </View>
        
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search name, email or phone..."
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
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Avatar.Icon size={60} icon="account-off" style={{ backgroundColor: '#F1F5F9' }} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No users found.</Text>
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
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  walletSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.success,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.textMuted,
  },
});
