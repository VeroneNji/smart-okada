import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, SafeAreaView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { AdminService } from '../services/admin.service';
import { Users, Bike, MapPin, Play, DollarSign, Wallet as WalletIcon, Hash, LogOut, ChevronRight, TrendingUp, Bell, Search, LayoutGrid, Settings } from 'lucide-react-native';
import { formatCurrency } from '../utils/formatters';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const ADMIN_EMAIL = 'veronenji2023@gmail.com';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const hasPermission = profile && (profile.is_admin || profile.email === ADMIN_EMAIL);
    if (profile && !hasPermission) {
      Alert.alert('Access Denied', 'Admin permissions required.', [
        { text: 'Back', onPress: () => router.replace('/(tabs)/dashboard') }
      ]);
    } else if (profile) {
      fetchStats();
    }
  }, [profile, fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <View style={styles.profileSection}>
            <Avatar.Text 
              size={40} 
              label="AD" 
              style={{ backgroundColor: COLORS.secondary }} 
              labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.adminName}>{profile?.full_name || 'Administrator'}</Text>
            </View>
          </View>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.iconCircle}>
              <Search size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Bell size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Main Financial Overview */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>TOTAL PLATFORM REVENUE</Text>
              <TrendingUp size={16} color={COLORS.success} />
            </View>
            <Text style={styles.revenueValue}>{formatCurrency(stats?.totalRevenue || 0)}</Text>
            <View style={styles.dividerLight} />
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>ACTIVE RIDES</Text>
                <Text style={styles.footerValue}>{stats?.activeRides || 0}</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>TOTAL BIKES</Text>
                <Text style={styles.footerValue}>{stats?.totalBikes || 0}</Text>
              </View>
            </View>
          </View>

          {/* Management Hub Grid */}
          <Text style={styles.sectionTitle}>Management Hub</Text>
          <View style={styles.hubGrid}>
            <HubItem 
              title="Bike Fleet" 
              subtitle="Manage units & prices"
              icon={Bike} 
              color="#4F46E5"
              onPress={() => router.push('/admin/bikes')} 
            />
            <HubItem 
              title="Stations" 
              subtitle="Network locations"
              icon={MapPin} 
              color="#059669"
              onPress={() => router.push('/admin/stations')} 
            />
            <HubItem 
              title="Users" 
              subtitle="Profiles & Roles"
              icon={Users} 
              color="#D97706"
              onPress={() => router.push('/admin/users')} 
            />
            <HubItem 
              title="Wallet" 
              subtitle="Platform finances"
              icon={WalletIcon} 
              color="#7C3AED"
              onPress={() => router.push('/admin/wallets')} 
            />
          </View>

          {/* Operational Tools */}
          <Text style={styles.sectionTitle}>Operational Tools</Text>
          <Card style={styles.toolsCard}>
            <ToolItem 
              title="Active Ride Monitor" 
              icon={Play} 
              onPress={() => router.push('/admin/rides')} 
            />
            <View style={styles.divider} />
            <ToolItem 
              title="Access Code Registry" 
              icon={Hash} 
              onPress={() => router.push('/admin/activation-codes')} 
            />
            <View style={styles.divider} />
            <ToolItem 
              title="System Settings" 
              icon={Settings} 
              onPress={() => {}} 
            />
          </Card>

          {/* Log Out */}
          <TouchableOpacity style={styles.logoutContainer} onPress={() => signOut()}>
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out of Admin Panel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const HubItem = ({ title, subtitle, icon: Icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.hubItem} onPress={onPress}>
    <View style={[styles.hubIcon, { backgroundColor: color + '10' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.hubTitle}>{title}</Text>
    <Text style={styles.hubSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ToolItem = ({ title, icon: Icon, onPress }: any) => (
  <TouchableOpacity style={styles.toolItem} onPress={onPress}>
    <View style={styles.toolIconContainer}>
      <Icon size={20} color={COLORS.secondary} />
    </View>
    <Text style={styles.toolText}>{title}</Text>
    <ChevronRight size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50 for a premium gray background
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  adminName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  navActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9', // Slate 100
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  mainCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 24,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  revenueValue: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 20,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  footerDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
    marginTop: 32,
    marginBottom: 16,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  hubItem: {
    width: (width - SPACING.lg * 2 - 16) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  hubSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  toolsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 0,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toolIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 72,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 10,
    paddingBottom: 20,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
