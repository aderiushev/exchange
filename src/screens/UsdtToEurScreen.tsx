import React, { useState } from 'react';
import { RefreshControl, ScrollView, Linking } from 'react-native';
import { YStack, Text, Spinner, Button, Input } from 'tamagui';
import { useExchangeStore } from '../store/exchangeStore';
import { VersionDisplay } from '../components/VersionDisplay';

export const UsdtToEurScreen = () => {
  const { usdtToEur, lastUpdated, isLoading, isRefreshing, error, refreshRates, clearError } = useExchangeStore();

  // State for input amount
  const [usdtInput, setUsdtInput] = useState('');

  // Calculate converted amount
  const calculateConversion = (input: string, rate: number | null): string => {
    if (!input || !rate) return '0.00';
    const amount = parseFloat(input);
    if (isNaN(amount)) return '0.00';
    return (amount * rate).toFixed(2);
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
                  <Text fontSize="$10" fontWeight="bold" color="#60a5fa">
                    {usdtToEur.rate.toFixed(4)}
                  </Text>
                  <Text fontSize="$4" color="#9ca3af">
                    1 USDT = {usdtToEur.rate.toFixed(4)} EUR
                  </Text>
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

                {/* Input Section */}
                <YStack space="$2" marginTop="$4" width="100%">
                  <Text fontSize="$3" color="#9ca3af">
                    Enter USDT amount:
                  </Text>
                  <Input
                    value={usdtInput}
                    onChangeText={setUsdtInput}
                    placeholder="0"
                    keyboardType="numeric"
                    backgroundColor="#111827"
                    borderColor="#3a3a3a"
                    color="#e5e7eb"
                    placeholderTextColor="#6b7280"
                    size="$4"
                  />
                  <YStack
                    backgroundColor="#0f172a"
                    padding="$3"
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="#1e293b"
                  >
                    <Text fontSize="$2" color="#9ca3af" marginBottom="$1">
                      You will receive:
                    </Text>
                    <Text fontSize="$5" fontWeight="bold" color="#10b981">
                      {calculateConversion(usdtInput, usdtToEur.rate)} EUR
                    </Text>
                  </YStack>
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

