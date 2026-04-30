import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, ActivityIndicator, List, IconButton } from 'react-native-paper';
import { Bell, BellOff, CheckCheck, Wallet, Bike, AlertCircle } from 'lucide-react-native';
import { useNotifications } from '../../hooks/useNotifications';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function NotificationsScreen() {
  const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return Wallet;
      case 'ride_start': return Bike;
      case 'ride_end': return Bike;
      default: return AlertCircle;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'deposit': return COLORS.success;
      case 'ride_start': return COLORS.primary;
      case 'ride_end': return COLORS.info;
      default: return COLORS.secondary;
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.some(n => !n.is_read) && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <CheckCheck size={18} color={COLORS.primary} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && notifications.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : notifications.length > 0 ? (
          <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          >
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <TouchableOpacity 
                  key={notification.id}
                  onPress={() => !notification.is_read && markAsRead(notification.id)}
                  style={[
                    styles.notificationItem,
                    !notification.is_read && styles.unreadItem
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) + '15' }]}>
                    <Icon size={20} color={getIconColor(notification.type)} />
                  </View>
                  <View style={styles.content}>
                    <Text style={[styles.title, !notification.is_read && styles.unreadText]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.message}>{notification.message}</Text>
                    <Text style={styles.time}>
                      {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {!notification.is_read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <BellOff size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>We'll notify you about your rides and transactions here.</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: COLORS.primary + '05',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '900',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: SPACING.lg,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
