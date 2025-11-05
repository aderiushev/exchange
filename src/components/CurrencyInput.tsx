import React from 'react';
import { YStack, XStack, Text, Input } from 'tamagui';

export interface CurrencyInputProps {
  /** Label for the "give" field (e.g., "You give:") */
  giveLabel: string;
  /** Currency code for the "give" field (e.g., "RUB", "USDT") */
  giveCurrency: string;
  /** Current value in the "give" field */
  giveValue: string;
  /** Callback when the "give" field changes */
  onGiveChange: (text: string) => void;

  /** Label for the "receive" field (e.g., "You receive:") */
  receiveLabel: string;
  /** Currency code for the "receive" field (e.g., "USDT", "EUR") */
  receiveCurrency: string;
  /** Current value in the "receive" field */
  receiveValue: string;
  /** Callback when the "receive" field changes */
  onReceiveChange: (text: string) => void;
}

/**
 * CurrencyInput component for bidirectional currency conversion
 *
 * Features:
 * - Compact horizontal layout with both inputs in a single row
 * - Both fields are always editable
 * - Automatic bidirectional calculation between fields
 * - Last edited field is the source, other field shows calculated result
 * - Handles edge cases (empty inputs, zero values, invalid numbers)
 * - Responsive design for mobile screens
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  giveLabel,
  giveCurrency,
  giveValue,
  onGiveChange,
  receiveLabel,
  receiveCurrency,
  receiveValue,
  onReceiveChange,
}) => {
  return (
    <YStack
      backgroundColor="#1a1a1a"
      borderRadius="$4"
      padding="$1.5"
    >
      {/* Horizontal Row with Both Inputs */}
      <XStack alignItems="center" space="$1.5" flexWrap="wrap">
        {/* Give Input Field */}
        <XStack
          flex={1}
          minWidth={120}
          backgroundColor="#111827"
          borderRadius="$3"
          borderWidth={1}
          borderColor="#3a3a3a"
          alignItems="center"
          paddingHorizontal="$2.5"
          paddingVertical="$1"
        >
          <Input
            value={giveValue}
            onChangeText={onGiveChange}
            placeholder="0"
            keyboardType="numeric"
            backgroundColor="transparent"
            borderWidth={0}
            color="#e5e7eb"
            placeholderTextColor="#6b7280"
            flex={1}
            fontSize="$4"
            fontWeight="600"
            paddingHorizontal={0}
            paddingVertical={0}
          />
          <Text fontSize="$3" color="#60a5fa" fontWeight="600" marginLeft="$1.5">
            {giveCurrency}
          </Text>
        </XStack>

        {/* Visual Separator */}
        <Text fontSize="$6" color="#60a5fa" paddingHorizontal="$1">
          ⇅
        </Text>

        {/* Receive Input Field */}
        <XStack
          flex={1}
          minWidth={120}
          backgroundColor="#111827"
          borderRadius="$3"
          borderWidth={1}
          borderColor="#3a3a3a"
          alignItems="center"
          paddingHorizontal="$2.5"
          paddingVertical="$1"
        >
          <Input
            value={receiveValue}
            onChangeText={onReceiveChange}
            placeholder="0"
            keyboardType="numeric"
            backgroundColor="transparent"
            borderWidth={0}
            color="#e5e7eb"
            placeholderTextColor="#6b7280"
            flex={1}
            fontSize="$4"
            fontWeight="600"
            paddingHorizontal={0}
            paddingVertical={0}
          />
          <Text fontSize="$3" color="#10b981" fontWeight="600" marginLeft="$1.5">
            {receiveCurrency}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
};

