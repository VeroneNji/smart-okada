import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, List, Divider } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/auth.service';
import { User, Mail, Phone, LogOut, ShieldCheck, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const isAdmin = profile?.is_admin || user?.email === 'veronenji2023@gmail.com';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={profile?.full_name?.substring(0, 2).toUpperCase() || 'UR'} 
          style={{ backgroundColor: theme.colors.primary, marginBottom: 16 }}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {profile?.full_name || 'Rider'}
        </Text>
        <Text variant="bodyMedium" style={styles.role}>
          Verified Rider
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content style={{ padding: 0 }}>
          <List.Item
            title="Email"
            description={user?.email || 'N/A'}
            left={props => <List.Icon {...props} icon={() => <Mail color="#666" size={24} />} />}
          />
          <Divider />
          <List.Item
            title="Phone Number"
            description={profile?.phone || 'N/A'}
            left={props => <List.Icon {...props} icon={() => <Phone color="#666" size={24} />} />}
          />
          <Divider />
          <List.Item
            title="Account Status"
            description="Active & Secure"
            left={props => <List.Icon {...props} icon={() => <ShieldCheck color="#4caf50" size={24} />} />}
          />
          {isAdmin && (
            <>
              <Divider />
              <List.Item
                title="Admin Dashboard"
                description="Manage users, bikes, and stations"
                left={props => <List.Icon {...props} icon={() => <Settings color="#1E3A8A" size={24} />} />}
                onPress={() => router.push('/admin')}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Button 
        mode="contained-tonal" 
        onPress={handleLogout} 
        style={styles.logoutButton}
        icon={() => <LogOut color={theme.colors.error} size={20} />}
        textColor={theme.colors.error}
      >
        Sign Out
      </Button>

      <Text variant="bodySmall" style={styles.version}>
        UrbanRide Network v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  name: {
    fontWeight: 'bold',
  },
  role: {
    color: '#4caf50',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#ffebee',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 32,
  },
});
