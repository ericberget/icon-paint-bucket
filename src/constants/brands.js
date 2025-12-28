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
    id: 'phathom',
    name: 'Phathom',
    primary: '#1A3A5C',
    secondary: '#E87722',
    accent: '#4A4A4A',
    gradient: 'from-blue-900 to-blue-800',
    bgLight: 'bg-blue-50',
  },
  {
    id: 'rigel',
    name: 'Rigel',
    primary: '#0057A8',
    secondary: '#002244',
    accent: '#E6F0F8',
    gradient: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
  },
  {
    id: 'alnylam',
    name: 'Alnylam',
    primary: '#E35724',
    secondary: '#2D2D2D',
    accent: '#F8E8E3',
    gradient: 'from-orange-500 to-red-600',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'jnj',
    name: 'Johnson & Johnson',
    primary: '#D51130',
    secondary: '#1A1A1A',
    accent: '#F5F5F5',
    gradient: 'from-red-600 to-red-700',
    bgLight: 'bg-red-50',
  },
  {
    id: 'custom',
    name: 'New Brand',
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
