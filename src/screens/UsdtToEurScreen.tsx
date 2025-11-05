import React, { useState } from 'react';
import { RefreshControl, ScrollView, Linking } from 'react-native';
import {YStack, Text, Spinner, Button, XStack} from 'tamagui';
import { useExchangeStore } from '../store/exchangeStore';
import { VersionDisplay } from '../components/VersionDisplay';
import { PriceDisplay } from '../components/PriceDisplay';
import { CurrencyInput } from '../components/CurrencyInput';

export const UsdtToEurScreen = () => {
  const { usdtToEur, lastUpdated, isLoading, isRefreshing, error, refreshRates, clearError } = useExchangeStore();

  // State for input amounts
  const [giveAmount, setGiveAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  // Handle give amount change - calculate receive amount
  // Rate represents: 1 USDT = X EUR (e.g., 0.95), so to convert USDT → EUR: multiply
  const handleGiveChange = (text: string) => {
    setGiveAmount(text);

    if (!text || !usdtToEur?.rate || usdtToEur.rate === 0) {
      setReceiveAmount('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setReceiveAmount('');
      return;
    }

    // Convert USDT to EUR: multiply by rate (1 USDT × 0.95 = 0.95 EUR)
    const converted = amount * usdtToEur.rate;
    setReceiveAmount(converted.toFixed(4));
  };

  // Handle receive amount change - calculate give amount (reverse)
  // To convert EUR → USDT: divide (0.95 EUR ÷ 0.95 = 1 USDT)
  const handleReceiveChange = (text: string) => {
    setReceiveAmount(text);

    if (!text || !usdtToEur?.rate || usdtToEur.rate === 0) {
      setGiveAmount('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setGiveAmount('');
      return;
    }

    // Convert EUR to USDT: divide by rate (0.95 EUR ÷ 0.95 = 1 USDT)
    const converted = amount / usdtToEur.rate;
    setGiveAmount(converted.toFixed(4));
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'Unknown';
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExchangePress = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const isStale = lastUpdated && !isNaN(lastUpdated) && Date.now() - lastUpdated > 5 * 60 * 1000;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#111827' }}
      style={{ backgroundColor: '#111827' }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshRates}
          tintColor="#60a5fa"
          colors={['#60a5fa']}
        />
      }
    >
      <YStack flex={1} padding="$4" backgroundColor="#111827">
        {isLoading && !usdtToEur ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="#60a5fa" />
            <Text marginTop="$4" color="#9ca3af">
              Loading exchange rate...
            </Text>
          </YStack>
        ) : error ? (
          <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
            <Text color="#ef4444" textAlign="center" paddingHorizontal="$4">
              {error}
            </Text>
            <Button onPress={clearError} backgroundColor="#60a5fa">
              Dismiss
            </Button>
          </YStack>
        ) : usdtToEur ? (
          <YStack space="$4" flex={1} justifyContent="center">
            <YStack
              padding="$4"
              backgroundColor="#1a1a1a"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#3a3a3a"
              shadowColor="#000"
              shadowOpacity={0.3}
              shadowRadius={8}
            >
              <YStack space="$4" alignItems="center">
                <YStack space="$2" alignItems="center">
                  <PriceDisplay
                    value={usdtToEur.rate}
                    baseFontSize={40}
                    color="#60a5fa"
                  />
                  <XStack alignItems="center">
                    <Text fontSize="$4" color="#9ca3af">
                      1 USDT ={' '}
                    </Text>
                    <PriceDisplay value={usdtToEur.rate} baseFontSize={16} color="#9ca3af" currency="EUR" />
                  </XStack>
                </YStack>

                <YStack alignItems="center" space="$2" marginTop="$4">
                  {usdtToEur.exchangeName && (
                    <Text fontSize="$3" color="#b0b0b0" textAlign="center">
                      Exchange: {usdtToEur.exchangeName}
                    </Text>
                  )}
                  {usdtToEur.exchangeUrl && (
                    <Text
                      fontSize="$2"
                      color="#60a5fa"
                      textDecorationLine="underline"
                      onPress={() => handleExchangePress(usdtToEur.exchangeUrl)}
                      cursor="pointer"
                    >
                      View Exchange
                    </Text>
                  )}
                </YStack>

                <YStack alignItems="center" space="$2" marginTop="$2">
                  <Text fontSize="$2" color={isStale ? '#fb923c' : '#9ca3af'}>
                    Last updated: {formatTimestamp(lastUpdated || 0)}
                  </Text>
                  {isStale && (
                    <Text fontSize="$2" color="#fb923c">
                      ⚠️ Data may be stale ({'>'}5 minutes old)
                    </Text>
                  )}
                </YStack>

                {/* Bidirectional Currency Input */}
                <YStack marginTop="$4" width="100%">
                  <CurrencyInput
                    giveLabel="You give:"
                    giveCurrency="USDT"
                    giveValue={giveAmount}
                    onGiveChange={handleGiveChange}
                    receiveLabel="You receive:"
                    receiveCurrency="EUR"
                    receiveValue={receiveAmount}
                    onReceiveChange={handleReceiveChange}
                  />
                </YStack>
              </YStack>
            </YStack>
          </YStack>
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color="#9ca3af">No data available</Text>
          </YStack>
        )}
        <VersionDisplay />
      </YStack>
    </ScrollView>
  );
};

