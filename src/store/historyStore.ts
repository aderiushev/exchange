import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';

export type CurrencyPair = 'RUB_USDT' | 'USDT_EUR' | 'RUB_EUR';

export interface HistoricalRate {
  id: string;
  pair: CurrencyPair;
  rate: number;
  exchangeName: string;
  exchangeUrl: string;
  timestamp: number;
}

interface HistoryState {
  // Data
  selectedPair: CurrencyPair;
  historicalRates: HistoricalRate[];

  // Loading states
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  setSelectedPair: (pair: CurrencyPair) => void;
  fetchHistoricalRates: (pair: CurrencyPair, limit?: number) => Promise<void>;
  clearError: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Initial state
  selectedPair: 'RUB_USDT',
  historicalRates: [],
  isLoading: false,
  error: null,

  // Set selected currency pair
  setSelectedPair: (pair: CurrencyPair) => {
    set({ selectedPair: pair });
    // Note: fetchHistoricalRates is called by useEffect in HistoryScreen when selectedPair changes
  },

  // Fetch historical rates for a currency pair
  fetchHistoricalRates: async (pair: CurrencyPair, limit: number = 100) => {
    set({ isLoading: true, error: null });

    try {
      // Get Firestore instance (uses default database)
      // Both the Cloud Function and client use the default Firestore database
      const snapshot = await firestore()
        .collection('exchangeRates')
        .where('pair', '==', pair)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const rates: HistoricalRate[] = snapshot.docs.map(doc => ({
        id: doc.id,
        pair: doc.data().pair,
        rate: doc.data().rate,
        exchangeName: doc.data().exchangeName,
        exchangeUrl: doc.data().exchangeUrl,
        timestamp: doc.data().timestamp,
      }));

      console.log(`Fetched ${rates.length} historical rates for ${pair}`);

      set({
        historicalRates: rates,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching historical rates:', error);

      let errorMessage = 'Failed to fetch historical rates';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
        historicalRates: [],
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

