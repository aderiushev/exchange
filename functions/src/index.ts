import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as cheerio from "cheerio";

// Initialize Firebase Admin
admin.initializeApp();

// Cache for exchange rates (60 seconds TTL)
interface CachedRate {
  rate: number;
  exchangeName: string;
  exchangeUrl: string;
  timestamp: number;
}

interface ExchangeRateData {
  rate: number;
  exchangeName: string;
  exchangeUrl: string;
}

const rateCache: { [key: string]: CachedRate } = {};
const CACHE_TTL = 1000 * 60 * 10; // 60 seconds

/**
 * Scrapes exchange rate, provider name, and provider URL from BestChange table
 * @param url - BestChange URL to scrape
 * @param rowIndex - Row index to extract (default: 3 for 3rd row)
 * @returns Exchange rate data including rate, exchange name, and exchange URL
 */
async function scrapeExchangeRate(
  url: string,
  rowIndex: number = 3
): Promise<ExchangeRateData> {
  try {
    // Check cache first
    const cacheKey = `${url}_${rowIndex}`;
    const cached = rateCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for ${url}`);
      return {
        rate: cached.rate,
        exchangeName: cached.exchangeName,
        exchangeUrl: cached.exchangeUrl,
      };
    }

    // Fetch the page
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Determine which row to use
    let actualRowIndex = rowIndex;
    let row = $(`#content_table tbody tr:nth-child(${rowIndex})`);

    // Fallback to row 2 if row 3 doesn't exist
    if (row.length === 0 && rowIndex === 3) {
      console.log(`Row ${rowIndex} not found, falling back to row 2`);
      actualRowIndex = 2;
      row = $(`#content_table tbody tr:nth-child(${actualRowIndex})`);
    }

    if (row.length === 0) {
      throw new Error("Exchange rate row not found in table");
    }

    // Extract rate from 3rd column
    const rateText = row.find("td:nth-child(3) div.fs")
      .first()
      .text()
      .trim();

    if (!rateText) {
      throw new Error("Exchange rate not found in table");
    }

    // Extract numeric value (e.g., "99.0000 RUB T-Bank" -> 99.0000)
    const rateMatch = rateText.match(/^([\d.]+)/);
    if (!rateMatch) {
      throw new Error(`Could not parse rate from: ${rateText}`);
    }

    const rate = parseFloat(rateMatch[1]);

    // Extract exchange name and URL from 2nd column (BestChange structure)
    const exchangeCell = row.find("td:nth-child(2)");

    // Name: short exchange name is in div.ca[translate="no"]
    let exchangeName = exchangeCell
      .find('.ca[translate="no"]')
      .first()
      .text()
      .trim();
    if (!exchangeName) {
      // Fallback to any .ca if translate attr missing
      exchangeName = exchangeCell.find('.ca').first().text().trim();
    }

    // URL: click redirect link lives in <a href="/click.php?...">
    let exchangeUrl =
      exchangeCell.find('a[href*="/click.php"]').first().attr('href') || "";

    // Make URL absolute if it's relative
    if (exchangeUrl && !exchangeUrl.startsWith("http")) {
      exchangeUrl = `https://www.bestchange.com${exchangeUrl}`;
    }

    // Fallback values if extraction failed
    if (!exchangeName) {
      exchangeName = "Unknown Exchange";
    }
    if (!exchangeUrl) {
      exchangeUrl = url;
    }

    console.log(`Scraped: rate=${rate}, exchange=${exchangeName}, url=${exchangeUrl}`);

    // Cache the result
    rateCache[cacheKey] = {
      rate,
      exchangeName,
      exchangeUrl,
      timestamp: Date.now(),
    };

    return { rate, exchangeName, exchangeUrl };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to scrape exchange rate: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Cloud Function: Get RUB to USDT (TRC20) exchange rate
 */
export const getRubToUsdt = functions.https.onCall(async () => {
  const url = "https://www.bestchange.com/tinkoff-to-tether-trc20.html";
  const data = await scrapeExchangeRate(url);

  return {
    rate: data.rate,
    exchangeName: data.exchangeName,
    exchangeUrl: data.exchangeUrl,
    timestamp: Date.now(),
    source: "RUB → USDT (TRC20)",
    url,
  };
});

/**
 * Cloud Function: Get USDT (TRC20) to EUR exchange rate
 */
export const getUsdtToEur = functions.https.onCall(async () => {
  const url = "https://www.bestchange.com/tether-trc20-to-revolut-euro.html";
  const data = await scrapeExchangeRate(url);

  return {
    rate: data.rate,
    exchangeName: data.exchangeName,
    exchangeUrl: data.exchangeUrl,
    timestamp: Date.now(),
    source: "USDT (TRC20) → EUR",
    url,
  };
});

/**
 * Cloud Function: Get RUB to EUR (direct) exchange rate
 */
export const getRubToEur = functions.https.onCall(async () => {
  const url = "https://www.bestchange.com/tinkoff-to-revolut-euro.html";
  const data = await scrapeExchangeRate(url);

  return {
    rate: data.rate,
    exchangeName: data.exchangeName,
    exchangeUrl: data.exchangeUrl,
    timestamp: Date.now(),
    source: "RUB → EUR (Direct)",
    url,
  };
});

/**
 * Cloud Function: Get all exchange rates at once
 */
export const getAllRates = functions.https.onCall(async () => {
  try {
    const [rubToUsdtData, usdtToEurData, rubToEurData] = await Promise.all([
      scrapeExchangeRate("https://www.bestchange.com/tinkoff-to-tether-trc20.html"),
      scrapeExchangeRate("https://www.bestchange.com/tether-trc20-to-revolut-euro.html"),
      scrapeExchangeRate("https://www.bestchange.com/tinkoff-to-revolut-euro.html"),
    ]);

    // Calculate indirect rate (RUB → USDT → EUR)
    const indirectRate = rubToUsdtData.rate * usdtToEurData.rate;

    return {
      rubToUsdt: {
        rate: rubToUsdtData.rate,
        exchangeName: rubToUsdtData.exchangeName,
        exchangeUrl: rubToUsdtData.exchangeUrl,
        source: "RUB → USDT (TRC20)",
      },
      usdtToEur: {
        rate: usdtToEurData.rate,
        exchangeName: usdtToEurData.exchangeName,
        exchangeUrl: usdtToEurData.exchangeUrl,
        source: "USDT (TRC20) → EUR",
      },
      rubToEur: {
        direct: rubToEurData.rate,
        indirect: indirectRate,
        exchangeName: rubToEurData.exchangeName,
        exchangeUrl: rubToEurData.exchangeUrl,
        source: "RUB → EUR",
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error fetching all rates:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to fetch all rates: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

export const scrapeAndStoreRates = functions.pubsub
  .schedule("*/10 * * * *") // Every 10 minutes
  .timeZone("Europe/Madrid")
  .onRun(async () => {
    try {
      console.log("Starting scheduled rate scraping...");

      // Get Firestore instance (using default database)
      // React Native Firebase client only supports the (default) database
      const db = admin.firestore();

      // Scrape all three currency pairs
      const [rubToUsdtData, usdtToEurData, rubToEurData] = await Promise.all([
        scrapeExchangeRate("https://www.bestchange.com/tinkoff-to-tether-trc20.html"),
        scrapeExchangeRate("https://www.bestchange.com/tether-trc20-to-revolut-euro.html"),
        scrapeExchangeRate("https://www.bestchange.com/tinkoff-to-revolut-euro.html"),
      ]);

      const timestamp = Date.now();

      // Store RUB → USDT rate
      await db.collection("exchangeRates").add({
        pair: "RUB_USDT",
        rate: rubToUsdtData.rate,
        exchangeName: rubToUsdtData.exchangeName,
        exchangeUrl: rubToUsdtData.exchangeUrl,
        timestamp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Store USDT → EUR rate
      await db.collection("exchangeRates").add({
        pair: "USDT_EUR",
        rate: usdtToEurData.rate,
        exchangeName: usdtToEurData.exchangeName,
        exchangeUrl: usdtToEurData.exchangeUrl,
        timestamp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Store RUB → EUR rate (direct)
      await db.collection("exchangeRates").add({
        pair: "RUB_EUR",
        rate: rubToEurData.rate,
        exchangeName: rubToEurData.exchangeName,
        exchangeUrl: rubToEurData.exchangeUrl,
        timestamp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Successfully stored exchange rates:", {
        rubToUsdt: rubToUsdtData.rate,
        usdtToEur: usdtToEurData.rate,
        rubToEur: rubToEurData.rate,
        timestamp,
      });

      return null;
    } catch (error) {
      console.error("Error in scheduled rate scraping:", error);
      throw error;
    }
  });

