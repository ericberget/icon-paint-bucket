/**
 * Color mapping utility for SVG recoloring
 * Handles various color formats: hex, RGB, named colors
 */

// Colors to preserve (should not be changed)
const PRESERVED_COLORS = [
  'white',
  '#fff',
  '#ffffff',
  'none',
  'transparent',
  'rgb(255, 255, 255)',
  'rgb(255,255,255)',
];

// Map of colors to their roles (black-ish → primary, gray → secondary, light gray → accent)
const COLOR_MAPPINGS = {
  // Black and dark colors → Primary
  primary: [
    '#000',
    '#000000',
    'black',
    '#333',
    '#333333',
    '#111',
    '#111111',
    '#222',
    '#222222',
    'rgb(0, 0, 0)',
    'rgb(0,0,0)',
    'rgb(51, 51, 51)',
    'rgb(51,51,51)',
  ],
  // Gray colors → Secondary
  secondary: [
    '#666',
    '#666666',
    '#808080',
    'gray',
    'grey',
    '#777',
    '#777777',
    '#888',
    '#888888',
    '#999',
    '#999999',
    'rgb(128, 128, 128)',
    'rgb(128,128,128)',
    'rgb(102, 102, 102)',
    'rgb(102,102,102)',
  ],
  // Light gray colors → Accent
  accent: [
    '#ccc',
    '#cccccc',
    '#ddd',
    '#dddddd',
    '#eee',
    '#eeeeee',
    '#aaa',
    '#aaaaaa',
    '#bbb',
    '#bbbbbb',
    'lightgray',
    'lightgrey',
    'silver',
    'rgb(204, 204, 204)',
    'rgb(204,204,204)',
  ],
};

/**
 * Normalize a color string for comparison
 * @param {string} color - The color to normalize
 * @returns {string} Normalized lowercase color
 */
const normalizeColor = (color) => {
  if (!color) return '';
  return color.toLowerCase().trim().replace(/\s+/g, '');
};

/**
 * Check if a color should be preserved
 * @param {string} color - The color to check
 * @returns {boolean} True if color should be preserved
 */
const shouldPreserve = (color) => {
  const normalized = normalizeColor(color);
  return PRESERVED_COLORS.some((p) => normalizeColor(p) === normalized);
};

/**
 * Get the role (primary/secondary/accent) for a given color
 * @param {string} color - The color to categorize
 * @returns {string|null} The role or null if not mapped
 */
const getColorRole = (color) => {
  const normalized = normalizeColor(color);

  for (const [role, colors] of Object.entries(COLOR_MAPPINGS)) {
    if (colors.some((c) => normalizeColor(c) === normalized)) {
      return role;
    }
  }
  return null;
};

/**
 * Parse a color string to RGB values
 * @param {string} color - The color to parse (hex or rgb format)
 * @returns {{r: number, g: number, b: number}|null} RGB values or null if unparseable
 */
const parseColorToRgb = (color) => {
  if (!color) return null;
  const normalized = normalizeColor(color);
  
  // Handle hex colors
  if (normalized.startsWith('#')) {
    let hex = normalized.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  
  // Handle rgb() colors
  const rgbMatch = normalized.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  
  return null;
};

/**
 * Check if a color is chromatic (has color, not grayscale)
 * @param {string} color - The color to check
 * @returns {boolean} True if color is chromatic
 */
const isChromatic = (color) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return false;
  
  // A color is chromatic if the RGB values differ significantly
  const maxDiff = Math.max(
    Math.abs(rgb.r - rgb.g),
    Math.abs(rgb.g - rgb.b),
    Math.abs(rgb.r - rgb.b)
  );
  
  // If any channel differs by more than 10, it's not grayscale
  return maxDiff > 10;
};

/**
 * Check if a color is dark (for distinguishing outlines from fills)
 * @param {string} color - The color to check
 * @returns {boolean} True if color is dark
 */
const isDarkColor = (color) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return false;
  
  // Calculate luminance (simplified)
  const luminance = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
  return luminance < 80; // Dark threshold
};

// Dark gray color for duotone outline
const DUOTONE_OUTLINE = '#2D2D2D';

/**
 * Replace a color with the appropriate brand color
 * @param {string} color - The original color
 * @param {object} brand - Brand object with primary, secondary, accent
 * @param {string} mode - Color mode: 'primary', 'secondary', 'gradient', 'duo-primary', 'duo-secondary'
 * @param {string} gradientId - Optional gradient ID for gradient mode
 * @returns {string} The replaced color or original if preserved
 */
const replaceColor = (color, brand, mode = 'primary', gradientId = null) => {
  if (!color || shouldPreserve(color)) {
    return color;
  }

  const role = getColorRole(color);
  
  // Duotone modes: dark outline + colored accent
  if (mode === 'duo-primary' || mode === 'duo-secondary') {
    const accentColor = mode === 'duo-primary' ? brand.primary : brand.secondary;
    
    // Check if it's in our predefined roles
    if (role) {
      // Primary colors (black/dark) → dark gray outline
      if (role === 'primary') {
        return DUOTONE_OUTLINE;
      }
      // Secondary (gray) and accent (light gray) → brand accent color
      if (role === 'secondary' || role === 'accent') {
        return accentColor;
      }
    }
    
    // For colors NOT in our mapping, check if chromatic or dark
    // Chromatic colors (any hue) → accent color
    if (isChromatic(color)) {
      return accentColor;
    }
    
    // Dark non-chromatic colors → dark outline
    if (isDarkColor(color)) {
      return DUOTONE_OUTLINE;
    }
    
    // Everything else that's not preserved → accent
    return accentColor;
  }
  
  // Standard modes
  if (role) {
    // For primary colors (black), use mode to determine replacement
    if (role === 'primary') {
      if (mode === 'gradient' && gradientId) {
        return `url(#${gradientId})`;
      } else if (mode === 'secondary') {
        return brand.secondary;
      } else {
        return brand.primary;
      }
    }
    // For secondary and accent, always use their respective brand colors
    if (role === 'secondary' && brand.secondary) {
      return brand.secondary;
    }
    if (role === 'accent' && brand.accent) {
      return brand.accent;
    }
  }
  
  // For standard modes, also replace chromatic colors as accent
  if (isChromatic(color)) {
    if (mode === 'secondary') {
      return brand.secondary;
    }
    return brand.primary;
  }

  return color;
};

/**
 * Process inline style attribute and replace colors
 * @param {string} style - The style attribute value
 * @param {object} brand - Brand colors
 * @param {string} mode - Color mode: 'primary', 'secondary', or 'gradient'
 * @param {string} gradientId - Optional gradient ID for gradient mode
 * @returns {string} Updated style string
 */
const processInlineStyle = (style, brand, mode = 'primary', gradientId = null) => {
  if (!style) return style;

  // Match color properties: fill, stroke, stop-color, color, background, background-color
  const colorProps = ['fill', 'stroke', 'stop-color', 'color', 'background', 'background-color'];

  let updatedStyle = style;

  colorProps.forEach((prop) => {
    // Match property: value patterns
    const regex = new RegExp(`(${prop})\\s*:\\s*([^;]+)`, 'gi');
    updatedStyle = updatedStyle.replace(regex, (match, property, value) => {
      const newColor = replaceColor(value.trim(), brand, mode, gradientId);
      return `${property}:${newColor}`;
    });
  });

  return updatedStyle;
};

/**
 * Main function to recolor an SVG string with brand colors
 * @param {string} svgString - The SVG content as a string
 * @param {object} brand - Brand object with primary, secondary, accent colors
 * @param {string} mode - Color mode: 'primary', 'secondary', or 'gradient' (default: 'primary')
 * @returns {string} The recolored SVG string
 */
export const recolorSvg = (svgString, brand, mode = 'primary') => {
  if (!svgString || !brand) {
    return svgString;
  }

  let result = svgString;
  
  // Generate unique gradient ID for gradient mode
  const gradientId = mode === 'gradient' ? `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null;
  
  // Add gradient definition if in gradient mode
  if (mode === 'gradient' && gradientId) {
    // Check if <defs> already exists
    const defsRegex = /<defs[^>]*>([\s\S]*?)<\/defs>/i;
    const gradientDef = `
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${brand.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${brand.secondary};stop-opacity:1" />
    </linearGradient>`;
    
    if (defsRegex.test(result)) {
      // Add gradient to existing <defs>
      result = result.replace(defsRegex, (match, defsContent) => {
        return `<defs>${defsContent}${gradientDef}</defs>`;
      });
    } else {
      // Add <defs> after opening <svg> tag
      const svgTagRegex = /(<svg[^>]*>)/i;
      result = result.replace(svgTagRegex, `$1<defs>${gradientDef}</defs>`);
    }
  }

  // Process fill, stroke, and stop-color attributes
  const colorAttributes = ['fill', 'stroke', 'stop-color'];

  colorAttributes.forEach((attr) => {
    // Match attribute="value" patterns (handles both single and double quotes)
    const regex = new RegExp(`(${attr})\\s*=\\s*["']([^"']+)["']`, 'gi');
    result = result.replace(regex, (match, attribute, value) => {
      const newColor = replaceColor(value, brand, mode, gradientId);
      return `${attribute}="${newColor}"`;
    });
  });

  // Process inline styles
  const styleRegex = /style\s*=\s*["']([^"']+)["']/gi;
  result = result.replace(styleRegex, (match, styleContent) => {
    const newStyle = processInlineStyle(styleContent, brand, mode, gradientId);
    return `style="${newStyle}"`;
  });

  // Process <style> blocks (CSS within SVG)
  const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  result = result.replace(styleBlockRegex, (match, cssContent) => {
    let newCss = cssContent;

    // Replace colors in CSS based on mode
    Object.entries(COLOR_MAPPINGS).forEach(([role, colors]) => {
      colors.forEach((color) => {
        const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cssRegex = new RegExp(escapedColor, 'gi');
        let replacement;
        
        // Duotone modes
        if (mode === 'duo-primary' || mode === 'duo-secondary') {
          const accentColor = mode === 'duo-primary' ? brand.primary : brand.secondary;
          if (role === 'primary') {
            replacement = DUOTONE_OUTLINE;
          } else {
            replacement = accentColor;
          }
        }
        // Standard modes
        else if (role === 'primary') {
          if (mode === 'gradient' && gradientId) {
            replacement = `url(#${gradientId})`;
          } else if (mode === 'secondary') {
            replacement = brand.secondary;
          } else {
            replacement = brand.primary;
          }
        } else {
          replacement = brand[role];
        }
        
        newCss = newCss.replace(cssRegex, replacement);
      });
    });
    
    // Also catch any hex colors not in our mapping (chromatic colors)
    const hexColorRegex = /#([0-9a-fA-F]{3}){1,2}\b/g;
    newCss = newCss.replace(hexColorRegex, (hexColor) => {
      // Skip preserved colors
      if (shouldPreserve(hexColor)) return hexColor;
      // Skip colors we already processed
      if (getColorRole(hexColor)) return hexColor;
      
      const accentColor = mode === 'duo-primary' ? brand.primary : 
                         mode === 'duo-secondary' ? brand.secondary :
                         mode === 'secondary' ? brand.secondary : brand.primary;
      
      // For duotone, check if dark or chromatic
      if (mode === 'duo-primary' || mode === 'duo-secondary') {
        if (isDarkColor(hexColor) && !isChromatic(hexColor)) {
          return DUOTONE_OUTLINE;
        }
        return accentColor;
      }
      
      // For standard modes, replace chromatic colors
      if (isChromatic(hexColor)) {
        return accentColor;
      }
      
      return hexColor;
    });

    return match.replace(cssContent, newCss);
  });

  return result;
};

/**
 * Parse SVG string to DOM element for preview
 * @param {string} svgString - The SVG content
 * @returns {string} Data URL for use in img src
 */
export const svgToDataUrl = (svgString) => {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encoded}`;
};

/**
 * Create a blob from SVG string for download
 * @param {string} svgString - The SVG content
 * @returns {Blob} SVG blob
 */
export const svgToBlob = (svgString) => {
  return new Blob([svgString], { type: 'image/svg+xml' });
};

export default {
  recolorSvg,
  svgToDataUrl,
  svgToBlob,
};
