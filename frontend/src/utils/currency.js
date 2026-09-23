/**
 * Formats monetary amounts in Tanzanian Shillings honoring the Canva `/=` notation.
 * e.g. 25000 -> "TSh 25,000 /="
 */
export function formatTsh(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'TSh 0 /=';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = Math.round(num).toLocaleString('en-US');
  return `TSh ${formatted} /=`;
}

/**
 * Format without currency prefix for compact UI if needed
 */
export function formatAmountNumber(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(num).toLocaleString('en-US');
}
