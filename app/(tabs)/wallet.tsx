import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, TextInput, Snackbar } from 'react-native-paper';
import { useWallet } from '../../hooks/useWallet';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function WalletScreen() {
  const { wallet, transactions, loading, refreshing, refresh, deposit } = useWallet();
  const [amount, setAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const theme = useTheme();

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(true);
      setMessage('Please enter a valid amount');
      return;
    }

    try {
      setDepositLoading(true);
      // Simulating a Mobile Money reference
      const ref = `MOMO-${Math.floor(Math.random() * 1000000)}`;
      await deposit(numAmount, ref);
      
      setAmount('');
      setError(false);
      setMessage('Deposit successful!');
      refresh();
    } catch (e: any) {
      setError(true);
      setMessage(e.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleTopup = async () => {
    try {
      setDepositLoading(true);
      const ref = `TEST-${Math.floor(Math.random() * 1000000)}`;
      await deposit(5000, ref);
      setMessage('Added 5,000 FCFA for testing!');
      setError(false);
      refresh();
    } catch (e: any) {
      setMessage(e.message);
      setError(true);
    } finally {
      setDepositLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const isDeposit = item.type === 'deposit';
    return (
      <View style={styles.transactionRow}>
        <View style={[styles.txIcon, { backgroundColor: isDeposit ? '#e8f5e9' : '#ffebee' }]}>
          {isDeposit ? (
            <ArrowDownLeft color="#4caf50" size={24} />
          ) : (
            <ArrowUpRight color="#f44336" size={24} />
          )}
        </View>
        <View style={styles.txInfo}>
          <Text variant="titleMedium">{isDeposit ? 'Deposit' : 'Ride Payment'}</Text>
          <Text variant="bodySmall" style={{ color: '#666' }}>
            {formatDate(item.created_at)} • {item.reference || 'N/A'}
          </Text>
        </View>
        <Text variant="titleMedium" style={{ color: isDeposit ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
          {isDeposit ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <Text variant="titleMedium" style={{ color: '#fff', opacity: 0.8 }}>Available Balance</Text>
            {loading && !refreshing ? (
              <ActivityIndicator color="#fff" style={{ marginVertical: 10 }} />
            ) : (
              <Text variant="displayMedium" style={{ color: '#fff', fontWeight: 'bold', marginVertical: 8 }}>
                {formatCurrency(wallet?.balance || 0)}
              </Text>
            )}
            <Button 
              mode="outlined" 
              onPress={handleTopup} 
              style={{ marginTop: 10, borderColor: '#fff' }}
              labelStyle={{ color: '#fff' }}
              loading={depositLoading}
              disabled={depositLoading}
            >
              Add 5,000 FCFA (Test)
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.depositCard}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Add Funds (Mobile Money)</Text>
            <View style={styles.depositRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Amount (FCFA)"
                mode="outlined"
                style={{ flex: 1, marginRight: 16, height: 50 }}
              />
              <Button 
                mode="contained" 
                onPress={handleDeposit}
                loading={depositLoading}
                disabled={depositLoading || !amount}
                style={{ height: 50, justifyContent: 'center' }}
              >
                Deposit
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {!wallet && !loading ? (
        <View style={styles.center}>
          <Text variant="titleLarge" style={{ color: theme.colors.error, fontWeight: 'bold', marginBottom: 8 }}>
            Wallet Not Found
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
            Your account may have been created before the system was fully set up.
            Please try signing up with a new account.
          </Text>
        </View>
      ) : (
        <View style={styles.historySection}>
          <Text variant="titleLarge" style={styles.historyTitle}>Transaction History</Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>No transactions yet.</Text>
              </View>
            }
          />
        </View>
      )}

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage('')}
        duration={3000}
        style={{ backgroundColor: error ? theme.colors.error : '#4caf50' }}
      >
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSection: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#1A1A1A',
    marginBottom: 16,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  depositCard: {
    backgroundColor: '#fff',
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historySection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    elevation: 4,
  },
  historyTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txInfo: {
    flex: 1,
  },
});
