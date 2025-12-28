/**
 * File handling utilities for SVG upload and download
 */

import JSZip from 'jszip';
import { svgToBlob } from './colorMapper';

/**
 * Read a file as text
 * @param {File} file - The file to read
 * @returns {Promise<string>} The file contents
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Validate that a file is an SVG
 * @param {File} file - The file to validate
 * @returns {boolean} True if valid SVG
 */
export const isValidSvg = (file) => {
  // Check MIME type
  if (file.type === 'image/svg+xml') return true;

  // Check file extension as fallback
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext === 'svg';
};

/**
 * Process multiple SVG files from a file input or drop event
 * @param {FileList|File[]} files - The files to process
 * @returns {Promise<Array>} Array of processed icon objects
 */
export const processSvgFiles = async (files) => {
  const results = [];

  for (const file of files) {
    if (!isValidSvg(file)) {
      console.warn(`Skipping non-SVG file: ${file.name}`);
      continue;
    }

    try {
      const content = await readFileAsText(file);

      // Basic SVG validation
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        console.warn(`Invalid SVG content in: ${file.name}`);
        continue;
      }

      results.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        originalContent: content,
        currentContent: content,
        paintedWith: null, // Brand ID that was used to paint this icon
        isPainted: false,
      });
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
    }
  }

  return results;
};

/**
 * Download a single SVG file
 * @param {string} content - The SVG content
 * @param {string} filename - The filename to use
 */
export const downloadSvg = (content, filename) => {
  const blob = svgToBlob(content);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Download multiple SVG files as a ZIP archive
 * @param {Array} icons - Array of icon objects with content and name
 * @param {string} zipFilename - Name for the ZIP file
 * @returns {Promise<void>}
 */
export const downloadAsZip = async (icons, zipFilename = 'icons.zip') => {
  const zip = new JSZip();

  // Add each icon to the ZIP
  icons.forEach((icon) => {
    // Use the current (possibly recolored) content
    const content = icon.currentContent || icon.originalContent;
    zip.file(icon.name, content);
  });

  // Generate the ZIP file
  const blob = await zip.generateAsync({ type: 'blob' });

  // Download the ZIP
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} The extension without dot
 */
export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Generate a unique filename if duplicate exists
 * @param {string} filename - The original filename
 * @param {Array} existingNames - Array of existing filenames
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (filename, existingNames) => {
  if (!existingNames.includes(filename)) {
    return filename;
  }

  const ext = getFileExtension(filename);
  const baseName = filename.replace(`.${ext}`, '');
  let counter = 1;
  let newName;

  do {
    newName = `${baseName}-${counter}.${ext}`;
    counter++;
  } while (existingNames.includes(newName));

  return newName;
};

export default {
  readFileAsText,
  isValidSvg,
  processSvgFiles,
  downloadSvg,
  downloadAsZip,
  getFileExtension,
  generateUniqueFilename,
};
