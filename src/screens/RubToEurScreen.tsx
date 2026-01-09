import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, Linking } from 'react-native';
import { YStack, Text, Spinner, Button } from 'tamagui';
import { useFocusEffect } from '@react-navigation/native';
import { useExchangeStore } from '../store/exchangeStore';
import { VersionDisplay } from '../components/VersionDisplay';
import { PriceDisplay } from '../components/PriceDisplay';
import { CurrencyInput } from '../components/CurrencyInput';

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

  // Fetch rates when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshRates();
    }, [refreshRates])
  );

  // State for RUB → USDT conversion
  const [rubToUsdtGive, setRubToUsdtGive] = useState('');
  const [rubToUsdtReceive, setRubToUsdtReceive] = useState('');

  // State for USDT → EUR conversion
  const [usdtToEurGive, setUsdtToEurGive] = useState('');
  const [usdtToEurReceive, setUsdtToEurReceive] = useState('');

  // State for RUB → EUR Indirect conversion
  const [rubToEurIndirectGive, setRubToEurIndirectGive] = useState('');
  const [rubToEurIndirectReceive, setRubToEurIndirectReceive] = useState('');

  // State for RUB → EUR Direct conversion
  const [rubToEurDirectGive, setRubToEurDirectGive] = useState('');
  const [rubToEurDirectReceive, setRubToEurDirectReceive] = useState('');

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleExchangePress = () => {
    if (rubToEurExchangeUrl) {
      Linking.openURL(rubToEurExchangeUrl);
    }
  };

  // Handlers for RUB → USDT
  // Rate represents: 1 USDT = X RUB, so to convert RUB → USDT: divide
  const handleRubToUsdtGiveChange = (text: string) => {
    setRubToUsdtGive(text);

    if (!text || !rubToUsdt?.rate || rubToUsdt.rate === 0) {
      setRubToUsdtReceive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setRubToUsdtReceive('');
      return;
    }

    // Convert RUB to USDT: divide by rate
    const converted = amount / rubToUsdt.rate;
    setRubToUsdtReceive(converted.toFixed(4));
  };

  const handleRubToUsdtReceiveChange = (text: string) => {
    setRubToUsdtReceive(text);

    if (!text || !rubToUsdt?.rate || rubToUsdt.rate === 0) {
      setRubToUsdtGive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setRubToUsdtGive('');
      return;
    }

    // Convert USDT to RUB: multiply by rate
    const converted = amount * rubToUsdt.rate;
    setRubToUsdtGive(converted.toFixed(2));
  };

  // Handlers for USDT → EUR
  // Rate represents: 1 USDT = X EUR, so to convert USDT → EUR: multiply
  const handleUsdtToEurGiveChange = (text: string) => {
    setUsdtToEurGive(text);

    if (!text || !usdtToEur?.rate || usdtToEur.rate === 0) {
      setUsdtToEurReceive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setUsdtToEurReceive('');
      return;
    }

    // Convert USDT to EUR: multiply by rate
    const converted = amount * usdtToEur.rate;
    setUsdtToEurReceive(converted.toFixed(4));
  };

  const handleUsdtToEurReceiveChange = (text: string) => {
    setUsdtToEurReceive(text);

    if (!text || !usdtToEur?.rate || usdtToEur.rate === 0) {
      setUsdtToEurGive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setUsdtToEurGive('');
      return;
    }

    // Convert EUR to USDT: divide by rate
    const converted = amount / usdtToEur.rate;
    setUsdtToEurGive(converted.toFixed(4));
  };

  // Handlers for RUB → EUR Indirect
  // Rate represents: 1 EUR = X RUB, so to convert RUB → EUR: divide
  const handleRubToEurIndirectGiveChange = (text: string) => {
    setRubToEurIndirectGive(text);

    if (!text || !rubToEurIndirect || rubToEurIndirect === 0) {
      setRubToEurIndirectReceive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setRubToEurIndirectReceive('');
      return;
    }

    // Convert RUB to EUR: divide by rate
    const converted = amount / rubToEurIndirect;
    setRubToEurIndirectReceive(converted.toFixed(4));
  };

  const handleRubToEurIndirectReceiveChange = (text: string) => {
    setRubToEurIndirectReceive(text);

    if (!text || !rubToEurIndirect || rubToEurIndirect === 0) {
      setRubToEurIndirectGive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setRubToEurIndirectGive('');
      return;
    }

    // Convert EUR to RUB: multiply by rate
    const converted = amount * rubToEurIndirect;
    setRubToEurIndirectGive(converted.toFixed(2));
  };

  // Handlers for RUB → EUR Direct
  // Rate represents: 1 EUR = X RUB, so to convert RUB → EUR: divide
  const handleRubToEurDirectGiveChange = (text: string) => {
    setRubToEurDirectGive(text);

    if (!text || !rubToEurDirect || rubToEurDirect === 0) {
      setRubToEurDirectReceive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setRubToEurDirectReceive('');
      return;
    }

    // Convert RUB to EUR: divide by rate
    const converted = amount / rubToEurDirect;
    setRubToEurDirectReceive(converted.toFixed(4));
  };

  const handleRubToEurDirectReceiveChange = (text: string) => {
    setRubToEurDirectReceive(text);

    if (!text || !rubToEurDirect || rubToEurDirect === 0) {
      setRubToEurDirectGive('');
      return;
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount === 0) {
      setRubToEurDirectGive('');
      return;
    }

    // Convert EUR to RUB: multiply by rate
    const converted = amount * rubToEurDirect;
    setRubToEurDirectGive(converted.toFixed(2));
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
                <YStack marginBottom="$3">
                  <PriceDisplay
                    value={rubToUsdt.rate}
                    baseFontSize={24}
                    color="#60a5fa"
                  />
                </YStack>

                {/* Bidirectional Currency Input */}
                <YStack marginTop="$3">
                  <CurrencyInput
                    giveLabel="You give:"
                    giveCurrency="RUB"
                    giveValue={rubToUsdtGive}
                    onGiveChange={handleRubToUsdtGiveChange}
                    receiveLabel="You receive:"
                    receiveCurrency="USDT"
                    receiveValue={rubToUsdtReceive}
                    onReceiveChange={handleRubToUsdtReceiveChange}
                  />
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
                <YStack marginBottom="$3">
                  <PriceDisplay
                    value={usdtToEur.rate}
                    baseFontSize={24}
                    color="#60a5fa"
                  />
                </YStack>

                {/* Bidirectional Currency Input */}
                <YStack marginTop="$3">
                  <CurrencyInput
                    giveLabel="You give:"
                    giveCurrency="USDT"
                    giveValue={usdtToEurGive}
                    onGiveChange={handleUsdtToEurGiveChange}
                    receiveLabel="You receive:"
                    receiveCurrency="EUR"
                    receiveValue={usdtToEurReceive}
                    onReceiveChange={handleUsdtToEurReceiveChange}
                  />
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
              <YStack marginBottom="$3">
                <PriceDisplay
                  value={rubToEurIndirect}
                  baseFontSize={24}
                  color="#60a5fa"
                />
              </YStack>

              {/* Calculation Breakdown */}
              {rubToUsdt && usdtToEur && (
                <YStack
                  padding="$3"
                  backgroundColor="#111827"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="#374151"
                  marginBottom="$3"
                  space="$2"
                >
                  <Text fontSize="$2" fontWeight="600" color="#e5e7eb">
                    Calculation Breakdown:
                  </Text>
                  <YStack space="$1">
                    <Text fontSize="$2" color="#9ca3af">
                      • RUB → USDT: 1 USDT = {rubToUsdt.rate.toFixed(4)} RUB
                    </Text>
                    <Text fontSize="$2" color="#9ca3af">
                      • USDT → EUR: 1 USDT = {usdtToEur.rate.toFixed(4)} EUR
                    </Text>
                    <Text fontSize="$2" color="#60a5fa" marginTop="$1">
                      Formula: (1 USDT in RUB) ÷ (1 USDT in EUR)
                    </Text>
                    <Text fontSize="$2" color="#60a5fa">
                      = {rubToUsdt.rate.toFixed(4)} ÷ {usdtToEur.rate.toFixed(4)} = {rubToEurIndirect.toFixed(4)} RUB per EUR
                    </Text>
                  </YStack>
                  <YStack marginTop="$2" space="$1">
                    <Text fontSize="$2" color="#6b7280">
                      Exchange sources:
                    </Text>
                    <Text fontSize="$1" color="#6b7280">
                      RUB→USDT: {rubToUsdt.exchangeName}
                    </Text>
                    <Text fontSize="$1" color="#6b7280">
                      USDT→EUR: {usdtToEur.exchangeName}
                    </Text>
                  </YStack>
                </YStack>
              )}

              {/* Bidirectional Currency Input */}
              <YStack marginTop="$3">
                <CurrencyInput
                  giveLabel="You give:"
                  giveCurrency="RUB"
                  giveValue={rubToEurIndirectGive}
                  onGiveChange={handleRubToEurIndirectGiveChange}
                  receiveLabel="You receive:"
                  receiveCurrency="EUR"
                  receiveValue={rubToEurIndirectReceive}
                  onReceiveChange={handleRubToEurIndirectReceiveChange}
                />
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
              <YStack marginBottom="$3">
                <PriceDisplay
                  value={rubToEurDirect}
                  baseFontSize={24}
                  color="#60a5fa"
                />
              </YStack>

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

              {/* Bidirectional Currency Input */}
              <YStack marginTop="$3">
                <CurrencyInput
                  giveLabel="You give:"
                  giveCurrency="RUB"
                  giveValue={rubToEurDirectGive}
                  onGiveChange={handleRubToEurDirectGiveChange}
                  receiveLabel="You receive:"
                  receiveCurrency="EUR"
                  receiveValue={rubToEurDirectReceive}
                  onReceiveChange={handleRubToEurDirectReceiveChange}
                />
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

