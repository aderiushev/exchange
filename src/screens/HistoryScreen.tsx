import React, { useEffect, useState, useRef } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Spinner, Button } from 'tamagui';
import { LineChart } from 'react-native-gifted-charts';
import { useHistoryStore, CurrencyPair } from '../store/historyStore';
import { Picker } from '@react-native-picker/picker';
import { VersionDisplay } from '../components/VersionDisplay';

const CURRENCY_PAIRS: { value: CurrencyPair; label: string }[] = [
  { value: 'RUB_USDT', label: 'RUB → USDT' },
  { value: 'USDT_EUR', label: 'USDT → EUR' },
  { value: 'RUB_EUR', label: 'RUB → EUR' },
];

export const HistoryScreen = () => {
  const {
    selectedPair,
    historicalRates,
    isLoading,
    error,
    setSelectedPair,
    fetchHistoricalRates,
    clearError,
  } = useHistoryStore();

  // Ref to track if user has manually scrolled
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const chartContainerRef = useRef<any>(null);

  // Fetch historical rates on mount and when selectedPair changes
  useEffect(() => {
    fetchHistoricalRates(selectedPair);
    // Reset scroll tracking when pair changes
    setHasUserScrolled(false);
  }, [selectedPair]);

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format timestamp for chart labels (concise time-only format)
  const formatChartLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format for compactness
    });
  };

  // Calculate Y-axis range for proper scaling
  const calculateYAxisRange = () => {
    if (historicalRates.length === 0) {
      return { yAxisOffset: 0, maxValue: 100, noOfSections: 5, stepValue: 20 };
    }

    const values = historicalRates.map(r => r.rate);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;

    // Add 10% padding above and below for better visualization
    const padding = range * 0.1 || 0.01; // Fallback to 0.01 if range is 0
    const yAxisOffset = minValue - padding;
    const yAxisMax = maxValue + padding;

    // IMPORTANT: When using yAxisOffset, maxValue represents the RANGE (height) of the chart,
    // not the absolute maximum value. The chart displays from yAxisOffset to (yAxisOffset + maxValue).
    // This must satisfy: maxValue = noOfSections * stepValue
    const chartRange = yAxisMax - yAxisOffset;
    const noOfSections = 5;
    const stepValue = chartRange / noOfSections;

    return {
      yAxisOffset,
      maxValue: chartRange, // This is the RANGE, not the absolute max!
      noOfSections,
      stepValue,
    };
  };

  const yAxisConfig = calculateYAxisRange();

  // Prepare chart data (reverse to show oldest to newest on chart)
  const chartData = historicalRates
    .slice()
    .reverse()
    .map((rate, index) => ({
      value: rate.rate,
      // Show label every 10 points with concise time format
      label: formatChartLabel(rate.timestamp),
      dataPointText: rate.rate.toFixed(4),
    }));

  console.log('Y-axis config:', yAxisConfig);
  console.log('Chart data sample:', chartData.slice(0, 3));

  // Handle manual scroll detection
  const handleScroll = () => {
    setHasUserScrolled(true);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111827' }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="#111827">
        <YStack gap="$2">
          <Text fontSize="$5" fontWeight="600" color="#e5e7eb">
            Select Currency Pair
          </Text>
          <YStack
            backgroundColor="#111827"
            borderRadius="$3"
            borderWidth={1}
            borderColor="#374151"
            overflow="hidden"
          >
            <Picker
              selectedValue={selectedPair}
              onValueChange={(value) => setSelectedPair(value as CurrencyPair)}
            >
              {CURRENCY_PAIRS.map((pair) => (
                <Picker.Item key={pair.value} label={pair.label} value={pair.value} />
              ))}
            </Picker>
          </YStack>
        </YStack>

        {/* Loading State */}
        {isLoading && (
          <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Spinner size="large" color="#60a5fa" />
            <Text marginTop="$4" color="#9ca3af">
              Loading historical data...
            </Text>
          </YStack>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <YStack justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text color="#ef4444" textAlign="center" paddingHorizontal="$4">
              {error}
            </Text>
            <Button onPress={clearError} backgroundColor="#60a5fa">
              Dismiss
            </Button>
          </YStack>
        )}

        {/* Chart and Data */}
        {!isLoading && !error && !!historicalRates.length && (
          <>
            {/* Chart */}
            <YStack
              backgroundColor="#1a1a1a"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#3a3a3a"
              padding="$2"
              overflow="hidden"
            >
              <Text fontSize="$5" fontWeight="600" color="#e5e7eb">
                Rate History Chart
              </Text>

              <LineChart
                scrollToEnd
                isAnimated
                animateOnDataChange
                data={chartData}
                color="#60a5fa"
                thickness={2}
                dataPointsColor="#60a5fa"
                dataPointsRadius={5}
                textColor="#9ca3af"
                textFontSize={10}
                yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                curved
                areaChart
                startFillColor="#60a5fa"
                endFillColor="#1f2937"
                startOpacity={0.3}
                endOpacity={0.1}
                initialSpacing={10}
                // Y-axis configuration for proper scaling
                yAxisOffset={yAxisConfig.yAxisOffset}
                maxValue={yAxisConfig.maxValue}
                noOfSections={yAxisConfig.noOfSections}
                stepValue={yAxisConfig.stepValue}
                formatYLabel={(label) => parseFloat(label).toFixed(3)}

                yAxisColor="#374151"
                xAxisColor="#374151"
                rulesColor="#374151"
              />
            </YStack>

            {/* Historical Data List */}
            <YStack
              borderRadius="$4"
              gap="$2"
            >
              <Text fontSize="$5" fontWeight="600" color="#e5e7eb">
                Historical Records
              </Text>

              {historicalRates.map((rate) => (
                <YStack
                  key={rate.id}
                  backgroundColor="#111827"
                  borderRadius="$3"
                  padding="$3"
                  borderWidth={1}
                  borderColor="#374151"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$6" fontWeight="bold" color="#60a5fa">
                      {rate.rate.toFixed(4)}
                    </Text>
                    <Text fontSize="$2" color="#6b7280">
                      {formatTimestamp(rate.timestamp)}
                    </Text>
                  </XStack>
                  <Text fontSize="$2" color="#9ca3af">
                    Exchange: {rate.exchangeName}
                  </Text>
                </YStack>
              ))}
            </YStack>
          </>
        )}

        {!isLoading && !error && !historicalRates.length && (
          <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
            <Text color="#9ca3af" textAlign="center">
              No historical data available for this currency pair.
            </Text>
            <Text color="#6b7280" textAlign="center" marginTop="$2" fontSize="$2">
              Data will appear once the scheduled function starts collecting rates.
            </Text>
          </YStack>
        )}
        <VersionDisplay />
      </YStack>
    </ScrollView>
  );
};

