/**
 * Format price in Chilean Pesos (CLP)
 * Removes decimals and adds dot as thousands separator
 * @param {number} price - Price to format
 * @returns {string} - Formatted price string (e.g., "1.000", "10.000", "100.000", "1.000.000")
 */
export const formatCLP = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0'
  }
  
  // Round to remove decimals and convert to integer
  const integerPrice = Math.round(price)
  
  // Convert to string and add thousands separator (dot)
  return integerPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

