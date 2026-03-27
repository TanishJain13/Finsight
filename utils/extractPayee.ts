// Merchant keyword to display name mapping
const MERCHANT_ALIASES: Record<string, string> = {
  swiggy: 'Swiggy',
  zomato: 'Zomato',
  uber: 'Uber',
  ola: 'Ola',
  amazon: 'Amazon',
  amzn: 'Amazon',
  flipkart: 'Flipkart',
  netflix: 'Netflix',
  spotify: 'Spotify',
  youtube: 'YouTube Premium',
  hotstar: 'Hotstar',
  jiocinema: 'JioCinema',
  apple: 'Apple',
  google: 'Google',
  paytm: 'Paytm',
  phonepe: 'PhonePe',
  gpay: 'Google Pay',
  razorpay: 'Razorpay',
  cashfree: 'Cashfree',
  myntra: 'Myntra',
  nykaa: 'Nykaa',
  zepto: 'Zepto',
  blinkit: 'Blinkit',
  dunzo: 'Dunzo',
  bigbasket: 'BigBasket',
  dominos: "Domino's",
  mcdonalds: "McDonald's",
  kfc: 'KFC',
  starbucks: 'Starbucks',
  bmw: 'BMW',
  irctc: 'IRCTC',
  makemytrip: 'MakeMyTrip',
  booking: 'Booking.com',
  airbnb: 'Airbnb',
  indigo: 'IndiGo',
  vistara: 'Vistara',
  byju: "BYJU'S",
  unacademy: 'Unacademy',
  leetcode: 'LeetCode',
  coursera: 'Coursera',
  udemy: 'Udemy',
  linkedinpremium: 'LinkedIn Premium',
  juspay: 'JusPay',
  hdfc: 'HDFC Bank',
  icici: 'ICICI Bank',
  sbi: 'SBI',
  axis: 'Axis Bank',
  kotak: 'Kotak Bank',
};

// Noise words to strip from descriptions
const NOISE_WORDS = [
  'upi', 'imps', 'neft', 'rtgs', 'nach', 'ecs',
  'payment', 'transfer', 'txn', 'transaction',
  'ref', 'refno', 'reference', 'id',
  'order', 'inv', 'invoice',
  'to', 'from', 'by', 'via', 'for',
  'pvt', 'ltd', 'private', 'limited',
  'services', 'service', 'solutions',
  'technologies', 'tech',
  'india', 'indian',
  'online', 'digital', 'pay',
  'debit', 'credit', 'bank',
  'account', 'acct', 'ac',
  'mobile', 'wallet',
  'auto', 'mandate',
];

/**
 * Attempt to extract a clean, readable merchant/payee name from a raw bank description
 */
export function extractPayee(description: string): string {
  if (!description) return 'Unknown';

  let cleaned = description.trim();

  // 1. Normalize separators: /, |, -, _, . to spaces
  cleaned = cleaned.replace(/[\/|_\-\.]+/g, ' ');

  // 2. Lowercase for matching
  const lower = cleaned.toLowerCase();

  // 3. Check merchant aliases first
  for (const [key, name] of Object.entries(MERCHANT_ALIASES)) {
    if (lower.includes(key)) return name;
  }

  // 4. Remove numeric segments (account numbers, dates, order IDs)
  cleaned = cleaned.replace(/\b\d{4,}\b/g, ' ');

  // 5. Strip noise words
  const words = cleaned.split(/\s+/).filter(Boolean);
  const filtered = words.filter(w => !NOISE_WORDS.includes(w.toLowerCase()));

  // 6. If it looks like a UPI handle (contains @), extract name before @
  const upiMatch = description.match(/([a-zA-Z][a-zA-Z\s]+)@[a-zA-Z]+/i);
  if (upiMatch) {
    return toTitleCase(upiMatch[1].trim());
  }

  // 7. Try to find meaningful part: take first 2–3 meaningful words
  const meaningful = filtered
    .filter(w => w.length > 2 && !/^\d+$/.test(w))
    .slice(0, 3)
    .join(' ');

  if (meaningful.length > 2) return toTitleCase(meaningful);

  // 8. Fallback: use first 30 chars of cleaned description
  return toTitleCase(description.replace(/[^a-zA-Z\s]/g, ' ').trim().slice(0, 30));
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
