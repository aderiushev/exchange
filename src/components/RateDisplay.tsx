import React from 'react';
import { YStack, Text, Linking } from 'tamagui';

interface RateDisplayProps {
  rate: number;
  source: string;
  timestamp: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeName?: string;
  exchangeUrl?: string;
}

export const RateDisplay: React.FC<RateDisplayProps> = ({
  rate,
  source,
  timestamp,
  fromCurrency,
  toCurrency,
  exchangeName,
  exchangeUrl,
}) => {
  const formatTimestamp = (ts: number) => {
    if (!ts || isNaN(ts)) {
      return 'Unknown';
    }
    const date = new Date(ts);
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

  const handleExchangePress = () => {
    if (exchangeUrl) {
      Linking.openURL(exchangeUrl);
    }
  };

  const isStale = timestamp && !isNaN(timestamp) && Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

  return (
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
              {rate.toFixed(4)}
            </Text>
            <Text fontSize="$4" color="#9ca3af">
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </Text>
          </YStack>

          <YStack alignItems="center" space="$2" marginTop="$4">
            {exchangeName && (
              <Text fontSize="$3" color="#b0b0b0" textAlign="center">
                Exchange: {exchangeName}
              </Text>
            )}
            {exchangeUrl && (
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

          <YStack alignItems="center" space="$2" marginTop="$2">
            <Text fontSize="$2" color={isStale ? '#fb923c' : '#9ca3af'}>
              Last updated: {formatTimestamp(timestamp)}
            </Text>
            {isStale && (
              <Text fontSize="$2" color="#fb923c">
                ⚠️ Data may be stale ({'>'}5 minutes old)
              </Text>
            )}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

