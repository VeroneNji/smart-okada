import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Avatar } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useRouter } from 'expo-router';
import { Wallet, Bike, Clock, Navigation, ChevronRight, Bell } from 'lucide-react-native';
import { formatCurrency } from '../../utils/formatters';
import { RideService } from '../../services/ride.service';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

import { useNotifications } from '../../hooks/useNotifications';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { wallet, loading: walletLoading, refresh: refreshWallet } = useWallet();
  const { unreadCount } = useNotifications();
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      fetchRecentRides();
      refreshWallet();
    }
  }, [profile]);

  const fetchRecentRides = async () => {
    if (!profile) return;
    try {
      setLoadingRides(true);
      const rides = await RideService.getRideHistory(profile.id);
      setRecentRides(rides.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent rides:', error);
    } finally {
      setLoadingRides(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refreshWallet();
    fetchRecentRides();
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>Hi, {profile?.full_name?.split(' ')[0] || 'Rider'}</Text>
            <Text style={styles.welcomeText}>Good to see you!</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Bell size={22} color={COLORS.secondary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Avatar.Text 
              size={40} 
              label={profile?.full_name?.[0] || 'U'} 
              style={styles.avatar} 
              labelStyle={styles.avatarLabel}
            />
          </View>
        </View>

        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Wallet Section - Modern Flat Design */}
          <View style={styles.walletSection}>
            <View style={styles.walletMain}>
              <View>
                <Text style={styles.walletLabel}>Available Balance</Text>
                {walletLoading ? (
                  <ActivityIndicator style={{ marginTop: 8 }} color={COLORS.white} />
                ) : (
                  <Text style={styles.balanceText}>{formatCurrency(wallet?.balance || 0)}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.addMoneyBtn}
                onPress={() => router.push('/(tabs)/wallet')}
              >
                <Text style={styles.addMoneyText}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionCard 
              icon={Bike} 
              label="Rent Bike" 
              onPress={() => router.push('/(tabs)/stations')}
              bgColor={COLORS.primaryLight}
              iconColor={COLORS.primary}
            />
            <ActionCard 
              icon={Navigation} 
              label="Stations" 
              onPress={() => router.push('/(tabs)/stations')}
              bgColor={COLORS.infoLight}
              iconColor={COLORS.info}
            />
            <ActionCard 
              icon={Clock} 
              label="History" 
              onPress={() => router.push('/(tabs)/trips')}
              bgColor={COLORS.successLight}
              iconColor={COLORS.success}
            />
          </View>

          {/* Promotion Card */}
          <TouchableOpacity style={styles.promoCard} activeOpacity={0.9}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Invite Friends</Text>
              <Text style={styles.promoDesc}>Get 500 FCFA for every friend you refer to the network.</Text>
            </View>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>SHARE</Text>
            </View>
          </TouchableOpacity>

          {/* Recent Rides */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trips')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loadingRides ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={COLORS.primary} />
          ) : recentRides.length > 0 ? (
            recentRides.map((ride) => (
              <TouchableOpacity 
                key={ride.id} 
                style={styles.rideItem}
                onPress={() => router.push(`/(tabs)/trips`)}
              >
                <View style={styles.rideIconContainer}>
                  <Bike size={20} color={COLORS.primary} />
                </View>
                <View style={styles.rideDetails}>
                  <Text style={styles.rideBikeCode}>{ride.bike?.code}</Text>
                  <Text style={styles.rideDate}>
                    {new Date(ride.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.rideEnd}>
                  <Text style={styles.rideCost}>-{formatCurrency(ride.total_cost || 0)}</Text>
                  <ChevronRight size={18} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No rides yet. Start your first journey!</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const ActionCard = ({ icon: Icon, label, onPress, bgColor, iconColor }: any) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIconContainer, { backgroundColor: bgColor }]}>
      <Icon size={24} color={iconColor} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  greetingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: COLORS.secondary,
  },
  avatarLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
  },
  walletSection: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  walletMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  addMoneyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  addMoneyText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  promoCard: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  promoDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingRight: 20,
  },
  promoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  promoBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rideIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rideDetails: {
    flex: 1,
  },
  rideBikeCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  rideDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rideEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideCost: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});


