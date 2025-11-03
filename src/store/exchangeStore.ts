import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';

export interface ExchangeRate {
  rate: number;
  exchangeName: string;
  exchangeUrl: string;
  source: string;
}

export interface RubToEurRates {
  direct: number;
  indirect: number;
  exchangeName: string;
  exchangeUrl: string;
  source: string;
}

export interface AllRatesData {
  rubToUsdt: ExchangeRate;
  usdtToEur: ExchangeRate;
  rubToEur: RubToEurRates;
  timestamp: number;
}

interface ExchangeState {
  // Data
  rubToUsdt: ExchangeRate | null;
  usdtToEur: ExchangeRate | null;
  rubToEurDirect: number | null;
  rubToEurIndirect: number | null;
  rubToEurExchangeName: string | null;
  rubToEurExchangeUrl: string | null;
  lastUpdated: number | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchAllRates: () => Promise<void>;
  refreshRates: () => Promise<void>;
  clearError: () => void;
}

/**
 * Helper function to fetch the latest exchange rate for a currency pair from Firestore
 */
async function fetchLatestRate(pair: 'RUB_USDT' | 'USDT_EUR' | 'RUB_EUR') {
  const snapshot = await firestore()
    .collection('exchangeRates')
    .where('pair', '==', pair)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error(`No data found for ${pair}. The scheduled function may not have run yet.`);
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    rate: data.rate,
    exchangeName: data.exchangeName,
    exchangeUrl: data.exchangeUrl,
    timestamp: data.timestamp,
  };
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  // Initial state
  rubToUsdt: null,
  usdtToEur: null,
  rubToEurDirect: null,
  rubToEurIndirect: null,
  rubToEurExchangeName: null,
  rubToEurExchangeUrl: null,
  lastUpdated: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  // Fetch all rates from Firestore
  fetchAllRates: async () => {
    const { isLoading, isRefreshing } = get();

    // Prevent multiple simultaneous fetches
    if (isLoading || isRefreshing) return;

    set({ isLoading: true, error: null });

    try {
      // Fetch latest rates for all three currency pairs in parallel
      const [rubToUsdtData, usdtToEurData, rubToEurData] = await Promise.all([
        fetchLatestRate('RUB_USDT'),
        fetchLatestRate('USDT_EUR'),
        fetchLatestRate('RUB_EUR'),
      ]);

      // Calculate indirect rate (RUB → USDT → EUR)
      const indirectRate = rubToUsdtData.rate * usdtToEurData.rate;

      // Use the most recent timestamp from all three queries
      const latestTimestamp = Math.max(
        rubToUsdtData.timestamp,
        usdtToEurData.timestamp,
        rubToEurData.timestamp
      );

      set({
        rubToUsdt: {
          rate: rubToUsdtData.rate,
          exchangeName: rubToUsdtData.exchangeName,
          exchangeUrl: rubToUsdtData.exchangeUrl,
          source: 'RUB → USDT (TRC20)',
        },
        usdtToEur: {
          rate: usdtToEurData.rate,
          exchangeName: usdtToEurData.exchangeName,
          exchangeUrl: usdtToEurData.exchangeUrl,
          source: 'USDT (TRC20) → EUR',
        },
        rubToEurDirect: rubToEurData.rate,
        rubToEurIndirect: indirectRate,
        rubToEurExchangeName: rubToEurData.exchangeName,
        rubToEurExchangeUrl: rubToEurData.exchangeUrl,
        lastUpdated: latestTimestamp,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching exchange rates from Firestore:', error);

      let errorMessage = 'Failed to fetch exchange rates';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Refresh rates (for pull-to-refresh)
  refreshRates: async () => {
    const { isLoading, isRefreshing } = get();

    // Prevent multiple simultaneous refreshes
    if (isLoading || isRefreshing) return;

    set({ isRefreshing: true, error: null });

    try {
      // Fetch latest rates for all three currency pairs in parallel
      const [rubToUsdtData, usdtToEurData, rubToEurData] = await Promise.all([
        fetchLatestRate('RUB_USDT'),
        fetchLatestRate('USDT_EUR'),
        fetchLatestRate('RUB_EUR'),
      ]);

      // Calculate indirect rate (RUB → USDT → EUR)
      const indirectRate = rubToUsdtData.rate * usdtToEurData.rate;

      // Use the most recent timestamp from all three queries
      const latestTimestamp = Math.max(
        rubToUsdtData.timestamp,
        usdtToEurData.timestamp,
        rubToEurData.timestamp
      );

      set({
        rubToUsdt: {
          rate: rubToUsdtData.rate,
          exchangeName: rubToUsdtData.exchangeName,
          exchangeUrl: rubToUsdtData.exchangeUrl,
          source: 'RUB → USDT (TRC20)',
        },
        usdtToEur: {
          rate: usdtToEurData.rate,
          exchangeName: usdtToEurData.exchangeName,
          exchangeUrl: usdtToEurData.exchangeUrl,
          source: 'USDT (TRC20) → EUR',
        },
        rubToEurDirect: rubToEurData.rate,
        rubToEurIndirect: indirectRate,
        rubToEurExchangeName: rubToEurData.exchangeName,
        rubToEurExchangeUrl: rubToEurData.exchangeUrl,
        lastUpdated: latestTimestamp,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing exchange rates from Firestore:', error);

      let errorMessage = 'Failed to refresh exchange rates';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isRefreshing: false,
        error: errorMessage,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

