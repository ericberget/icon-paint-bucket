/**
 * Brand color configurations for the paint bucket selector
 * Each brand has a primary, secondary, and accent color
 */

export const BRANDS = [
  {
    id: 'rinvoq',
    name: 'RINVOQ Yellow',
    primary: '#FFD200',
    secondary: '#000000',
    accent: '#F5F5F5',
    // Gradient for the paint bucket visual
    gradient: 'from-yellow-400 to-yellow-500',
    // Light version for backgrounds
    bgLight: 'bg-yellow-50',
  },
  {
    id: 'novartis',
    name: 'Novartis Orange',
    primary: '#ED6A00',
    secondary: '#002B49',
    accent: '#E5E5E5',
    gradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'gsk',
    name: 'GSK Orange',
    primary: '#FF6200',
    secondary: '#000000',
    accent: '#4A4A4A',
    gradient: 'from-orange-400 to-red-500',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'custom',
    name: 'Custom Brand',
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#E2E8F0',
    gradient: 'from-blue-600 to-blue-800',
    bgLight: 'bg-blue-50',
  },
];

/**
 * Default brand to use when app loads (can be overridden by localStorage)
 */
export const DEFAULT_BRAND_ID = 'rinvoq';

/**
 * Get a brand by its ID
 * @param {string} id - The brand ID to find
 * @returns {object|undefined} The brand object or undefined
 */
export const getBrandById = (id) => BRANDS.find((brand) => brand.id === id);
