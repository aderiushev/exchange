import React from 'react';
import { Text, XStack } from 'tamagui';

export interface PriceDisplayProps {
  /** The amount to display */
  value: number | string | null;
  /** Currency code (e.g., "RUB", "USDT", "EUR") */
  currency?: string;
  /** Base font size in pixels (default: 24) */
  baseFontSize?: number;
  /** Text color (default: "#10b981") */
  color?: string;
  /** Font weight (default: "bold") */
  fontWeight?: string;
}

interface FormattedParts {
  integerPart: string;
  firstDecimals: string;
  remainingDecimals: string;
}

/**
 * Formats a number with thousands separator (space) and splits decimals
 * @param value - The numeric value to format
 * @returns Formatted parts: integer, first 3 decimals, remaining decimals
 */
function formatNumber(value: number): FormattedParts {
  // Handle edge cases
  if (!isFinite(value) || isNaN(value)) {
    return { integerPart: '0', firstDecimals: '', remainingDecimals: '' };
  }

  // Format to max 4 decimal places
  const formatted = value.toFixed(4);
  
  // Split into integer and decimal parts
  const [intPart, decPart] = formatted.split('.');
  
  // Add thousands separator (space) to integer part
  const integerWithSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Trim trailing zeros from decimal part
  const trimmedDecimals = decPart ? decPart.replace(/0+$/, '') : '';
  
  // Split decimals: first 3 digits and remaining
  const firstDecimals = trimmedDecimals.slice(0, 3);
  const remainingDecimals = trimmedDecimals.slice(3);
  
  return {
    integerPart: integerWithSeparator,
    firstDecimals,
    remainingDecimals,
  };
}

/**
 * PriceDisplay component for displaying currency amounts with enhanced readability
 * 
 * Features:
 * - Maximum 4 decimal places (trailing zeros trimmed)
 * - Thousands separator using space character
 * - Progressive font sizing for visual hierarchy
 * - Monospaced font variant for better alignment
 * - Handles edge cases (very small numbers, zero, null)
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  value,
  currency,
  baseFontSize = 24,
  color = '#10b981',
  fontWeight = 'bold',
}) => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return (
      <XStack alignItems="baseline" gap="$1">
        <Text
          fontSize={baseFontSize}
          fontWeight={fontWeight}
          color={color}
          fontFamily="$mono"
        >
          0
        </Text>
        {currency && (
          <Text
            fontSize={baseFontSize * 0.7}
            fontWeight={fontWeight}
            color={color}
            marginLeft="$1"
          >
            {currency}
          </Text>
        )}
      </XStack>
    );
  }

  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(numValue) || !isFinite(numValue)) {
    return (
      <XStack alignItems="baseline" gap="$1">
        <Text
          fontSize={baseFontSize}
          fontWeight={fontWeight}
          color={color}
          fontFamily="$mono"
        >
          0
        </Text>
        {currency && (
          <Text
            fontSize={baseFontSize * 0.7}
            fontWeight={fontWeight}
            color={color}
            marginLeft="$1"
          >
            {currency}
          </Text>
        )}
      </XStack>
    );
  }

  // Handle very small numbers (< 0.0001) - show in scientific notation
  if (numValue > 0 && numValue < 0.0001) {
    return (
      <XStack alignItems="baseline" gap="$1">
        <Text
          fontSize={baseFontSize}
          fontWeight={fontWeight}
          color={color}
          fontFamily="$mono"
        >
          {numValue.toExponential(2)}
        </Text>
        {currency && (
          <Text
            fontSize={baseFontSize * 0.7}
            fontWeight={fontWeight}
            color={color}
            marginLeft="$1"
          >
            {currency}
          </Text>
        )}
      </XStack>
    );
  }

  const { integerPart, firstDecimals, remainingDecimals } = formatNumber(numValue);

  // Calculate font sizes for progressive hierarchy
  const mediumFontSize = baseFontSize * 0.8; // 20% smaller
  const smallFontSize = baseFontSize * 0.6; // 40% smaller

  return (
    <XStack alignItems="baseline" gap="$0.5">
      {/* Integer part - largest font */}
      <Text
        fontSize={baseFontSize}
        fontWeight={fontWeight}
        color={color}
        fontFamily="$mono"
        letterSpacing={0.5}
      >
        {integerPart}
      </Text>

      {/* Decimal point and first 3 decimals - medium font */}
      {firstDecimals && (
        <Text
          fontSize={mediumFontSize}
          fontWeight={fontWeight}
          color={color}
          fontFamily="$mono"
        >
          .{firstDecimals}
        </Text>
      )}

      {/* Remaining decimals - smallest font */}
      {remainingDecimals && (
        <Text
          fontSize={smallFontSize}
          fontWeight={fontWeight}
          color={color}
          fontFamily="$mono"
        >
          {remainingDecimals}
        </Text>
      )}

      {/* Currency code */}
      {currency && (
        <Text
          fontSize={baseFontSize * 0.7}
          fontWeight={fontWeight}
          color={color}
          marginLeft="$1.5"
        >
          {currency}
        </Text>
      )}
    </XStack>
  );
};

