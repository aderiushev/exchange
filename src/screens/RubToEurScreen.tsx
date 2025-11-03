import React, { useState } from 'react';
import { RefreshControl, ScrollView, Linking } from 'react-native';
import { YStack, Text, Spinner, Button, Input } from 'tamagui';
import { useExchangeStore } from '../store/exchangeStore';
import { VersionDisplay } from '../components/VersionDisplay';

export const RubToEurScreen = () => {
  const {
    rubToEurDirect,
    rubToEurIndirect,
    rubToEurExchangeName,
    rubToEurExchangeUrl,
    rubToUsdt,
    usdtToEur,
    lastUpdated,
    isLoading,
    isRefreshing,
    error,
    refreshRates,
    clearError,
  } = useExchangeStore();

  // State for input amounts
  const [rubToUsdtInput, setRubToUsdtInput] = useState('');
  const [usdtToEurInput, setUsdtToEurInput] = useState('');
  const [rubToEurDirectInput, setRubToEurDirectInput] = useState('');
  const [rubToEurIndirectInput, setRubToEurIndirectInput] = useState('');

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleExchangePress = () => {
    if (rubToEurExchangeUrl) {
      Linking.openURL(rubToEurExchangeUrl);
    }
  };

  // Calculate converted amounts
  const calculateConversion = (input: string, rate: number | null): string => {
    if (!input || !rate) return '0.00';
    const amount = parseFloat(input);
    if (isNaN(amount)) return '0.00';
    return (amount * rate).toFixed(2);
  };

  const isStale = lastUpdated && Date.now() - lastUpdated > 5 * 60 * 1000; // 5 minutes

  return (
    <ScrollView
      style={{ backgroundColor: '#111827' }}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshRates}
          tintColor="#60a5fa"
          colors={['#60a5fa']}
        />
      }
    >
      <YStack flex={1} backgroundColor="#111827">
        {isLoading && !rubToEurDirect && !rubToEurIndirect ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="#60a5fa" />
            <Text marginTop="$4" color="#9ca3af">
              Loading exchange rates...
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
        ) : rubToEurDirect !== null && rubToEurIndirect !== null ? (
          <YStack space="$4" padding="$4">
            {/* RUB → USDT Conversion Card */}
            {rubToUsdt && (
              <YStack
                padding="$4"
                backgroundColor="#1a1a1a"
                borderRadius="$4"
                borderWidth={1}
                borderColor="#3a3a3a"
              >
                <Text fontSize="$5" fontWeight="600" color="#e5e7eb" marginBottom="$2">
                  RUB → USDT
                </Text>
                <Text fontSize="$6" fontWeight="bold" color="#60a5fa" marginBottom="$3">
                  {rubToUsdt.rate.toFixed(4)}
                </Text>

                {/* Input Section */}
                <YStack space="$2" marginTop="$3">
                  <Text fontSize="$3" color="#9ca3af">
                    Enter RUB amount:
                  </Text>
                  <Input
                    value={rubToUsdtInput}
                    onChangeText={setRubToUsdtInput}
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
                      {calculateConversion(rubToUsdtInput, rubToUsdt.rate)} USDT
                    </Text>
                  </YStack>
                </YStack>
              </YStack>
            )}

            {/* USDT → EUR Conversion Card */}
            {usdtToEur && (
              <YStack
                padding="$4"
                backgroundColor="#1a1a1a"
                borderRadius="$4"
                borderWidth={1}
                borderColor="#3a3a3a"
              >
                <Text fontSize="$5" fontWeight="600" color="#e5e7eb" marginBottom="$2">
                  USDT → EUR
                </Text>
                <Text fontSize="$6" fontWeight="bold" color="#60a5fa" marginBottom="$3">
                  {usdtToEur.rate.toFixed(4)}
                </Text>

                {/* Input Section */}
                <YStack space="$2" marginTop="$3">
                  <Text fontSize="$3" color="#9ca3af">
                    Enter USDT amount:
                  </Text>
                  <Input
                    value={usdtToEurInput}
                    onChangeText={setUsdtToEurInput}
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
                      {calculateConversion(usdtToEurInput, usdtToEur.rate)} EUR
                    </Text>
                  </YStack>
                </YStack>
              </YStack>
            )}

            {/* Indirect Rate */}
            <YStack
              padding="$4"
              backgroundColor="#1a1a1a"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#3a3a3a"
            >
              <Text fontSize="$5" fontWeight="600" color="#e5e7eb" marginBottom="$2">
                RUB → EUR (Indirect)
              </Text>
              <Text fontSize="$3" color="#9ca3af" marginBottom="$3">
                RUB → USDT → EUR
              </Text>
              <Text fontSize="$6" fontWeight="bold" color="#60a5fa" marginBottom="$3">
                {rubToEurIndirect.toFixed(4)}
              </Text>

              {/* Input Section */}
              <YStack space="$2" marginTop="$3">
                <Text fontSize="$3" color="#9ca3af">
                  Enter RUB amount:
                </Text>
                <Input
                  value={rubToEurIndirectInput}
                  onChangeText={setRubToEurIndirectInput}
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
                    {calculateConversion(rubToEurIndirectInput, rubToEurIndirect)} EUR
                  </Text>
                </YStack>
              </YStack>
            </YStack>

            {/* Direct Rate */}
            <YStack
              padding="$4"
              backgroundColor="#1a1a1a"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#3a3a3a"
            >
              <Text fontSize="$5" fontWeight="600" color="#e5e7eb" marginBottom="$2">
                RUB → EUR (Direct)
              </Text>
              <Text fontSize="$3" color="#9ca3af" marginBottom="$3">
                Direct exchange from BestChange
              </Text>
              <Text fontSize="$6" fontWeight="bold" color="#60a5fa" marginBottom="$3">
                {rubToEurDirect.toFixed(4)}
              </Text>

              {/* Exchange Name and URL */}
              {rubToEurExchangeName && (
                <YStack space="$2" marginBottom="$3" alignItems="center">
                  <Text fontSize="$3" color="#b0b0b0" textAlign="center">
                    Exchange: {rubToEurExchangeName}
                  </Text>
                  {rubToEurExchangeUrl && (
                    <Text
                      fontSize="$2"
                      color="#60a5fa"
                      textDecorationLine="underline"
                      onPress={handleExchangePress}
                      cursor="pointer"
                    >
                      View Exchange
                    </Text>
                  )}
                </YStack>
              )}

              {/* Input Section */}
              <YStack space="$2" marginTop="$3">
                <Text fontSize="$3" color="#9ca3af">
                  Enter RUB amount:
                </Text>
                <Input
                  value={rubToEurDirectInput}
                  onChangeText={setRubToEurDirectInput}
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
                    {calculateConversion(rubToEurDirectInput, rubToEurDirect)} EUR
                  </Text>
                </YStack>
              </YStack>
            </YStack>

            {/* Comparison */}
            <YStack
              padding="$4"
              backgroundColor="#1a1a1a"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#3a3a3a"
            >
              <Text fontSize="$5" fontWeight="600" color="#e5e7eb" marginBottom="$3">
                Savings Analysis
              </Text>
              <YStack space="$2">
                <Text color="#9ca3af">Indirect route savings:</Text>
                <Text fontSize="$6" fontWeight="bold" color={
                  rubToEurIndirect < rubToEurDirect ? '#10b981' : '#ef4444'
                }>
                  {((rubToEurDirect - rubToEurIndirect) / rubToEurDirect * 100).toFixed(2)}%
                </Text>
              </YStack>
              <Text fontSize="$3" color="#9ca3af" marginTop="$3">
                {rubToEurIndirect < rubToEurDirect
                  ? '✓ Indirect route gives better rate (lower cost)'
                  : '✗ Direct route gives better rate (lower cost)'}
              </Text>
            </YStack>

            {/* Last Updated */}
            {lastUpdated && (
              <YStack alignItems="center" marginTop="$2">
                <Text color="#9ca3af" fontSize="$2">
                  Last updated: {formatTimestamp(lastUpdated)}
                </Text>
                {isStale && (
                  <Text color="#fb923c" fontSize="$2" marginTop="$1">
                    ⚠️ Data may be stale ({">"}5 minutes old)
                  </Text>
                )}
              </YStack>
            )}
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

