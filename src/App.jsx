/**
 * Main App Component
 * Icon Paint Bucket - SVG Recoloring Tool
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import DropZone from './components/DropZone';
import PaintBucket from './components/PaintBucket';
import IconGrid from './components/IconGrid';
import { BRANDS, DEFAULT_BRAND_ID, getBrandById } from './constants/brands';
import { recolorSvg } from './utils/colorMapper';
import { processSvgFiles, downloadSvg, downloadAsZip } from './utils/fileHandler';

// LocalStorage key for persisting selected brand
const STORAGE_KEY = 'icon-paint-bucket-brand';

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      fixed bottom-4 right-4 z-50
      px-6 py-3 rounded-lg shadow-lg
      flex items-center gap-3
      animate-slide-up
      ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
    `}>
      {type === 'success' && (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      {type === 'info' && (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )}
      <span className="text-white font-medium">{message}</span>
    </div>
  );
};

function App() {
  // State for icons
  const [icons, setIcons] = useState([]);

  // State for selected brand (with localStorage persistence)
  const [selectedBrandId, setSelectedBrandId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || DEFAULT_BRAND_ID;
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Get the selected brand object
  const selectedBrand = useMemo(() => {
    return getBrandById(selectedBrandId);
  }, [selectedBrandId]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = icons.length;
    const painted = icons.filter((icon) => icon.isPainted).length;
    return { total, painted };
  }, [icons]);

  // Persist brand selection to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedBrandId);
  }, [selectedBrandId]);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Handle brand selection
  const handleBrandSelect = useCallback((brandId) => {
    setSelectedBrandId(brandId);
    const brand = getBrandById(brandId);
    showToast(`Selected ${brand.name}`, 'info');
  }, [showToast]);

  // Handle file uploads
  const handleFilesAdded = useCallback(async (files) => {
    try {
      const newIcons = await processSvgFiles(files);
      if (newIcons.length === 0) {
        showToast('No valid SVG files found', 'error');
        return;
      }
      setIcons((prev) => [...prev, ...newIcons]);
      showToast(`Added ${newIcons.length} icon${newIcons.length > 1 ? 's' : ''}`, 'success');
    } catch (error) {
      console.error('Error processing files:', error);
      showToast('Error processing files', 'error');
    }
  }, [showToast]);

  // Handle painting a single icon
  const handlePaintIcon = useCallback((iconId) => {
    if (!selectedBrand) return;

    setIcons((prev) =>
      prev.map((icon) => {
        if (icon.id !== iconId) return icon;

        const recolored = recolorSvg(icon.originalContent, selectedBrand);
        return {
          ...icon,
          currentContent: recolored,
          paintedWith: selectedBrand.id,
          isPainted: true,
        };
      })
    );

    showToast(`Painted with ${selectedBrand.name}!`, 'success');
  }, [selectedBrand, showToast]);

  // Handle downloading a single icon
  const handleDownloadIcon = useCallback((icon) => {
    downloadSvg(icon.currentContent, icon.name);
    showToast(`Downloaded ${icon.name}`, 'success');
  }, [showToast]);

  // Handle removing a single icon
  const handleRemoveIcon = useCallback((iconId) => {
    setIcons((prev) => prev.filter((icon) => icon.id !== iconId));
  }, []);

  // Handle batch download all icons
  const handleDownloadAll = useCallback(async () => {
    if (icons.length === 0) return;

    try {
      await downloadAsZip(icons, 'icons-painted.zip');
      showToast(`Downloaded ${icons.length} icons as ZIP`, 'success');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      showToast('Error creating ZIP file', 'error');
    }
  }, [icons, showToast]);

  // Handle painting all icons
  const handlePaintAll = useCallback(() => {
    if (!selectedBrand || icons.length === 0) return;

    setIcons((prev) =>
      prev.map((icon) => {
        const recolored = recolorSvg(icon.originalContent, selectedBrand);
        return {
          ...icon,
          currentContent: recolored,
          paintedWith: selectedBrand.id,
          isPainted: true,
        };
      })
    );

    showToast(`Painted all icons with ${selectedBrand.name}!`, 'success');
  }, [selectedBrand, icons, showToast]);

  // Handle clearing all icons
  const handleClearAll = useCallback(() => {
    setIcons([]);
    showToast('Cleared all icons', 'info');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left sidebar - Paint Buckets */}
        <aside className="w-full lg:w-80 p-6 bg-black/20 backdrop-blur-sm lg:min-h-screen">
          {/* Logo and title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Icon Paint Bucket</h1>
              <p className="text-white/60 text-sm">SVG Recoloring Tool</p>
            </div>
          </div>

          {/* Paint bucket selector */}
          <div className="space-y-3 mb-8">
            <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">
              Select Brand Colors
            </h2>
            {BRANDS.map((brand) => (
              <PaintBucket
                key={brand.id}
                brand={brand}
                isSelected={selectedBrandId === brand.id}
                onClick={() => handleBrandSelect(brand.id)}
              />
            ))}
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white/80 text-sm font-semibold mb-2">How to use</h3>
            <ol className="text-white/60 text-xs space-y-2 list-decimal list-inside">
              <li>Select a brand color palette above</li>
              <li>Drop your SVG files in the upload area</li>
              <li>Click on icons to paint them</li>
              <li>Download individually or as a ZIP</li>
            </ol>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Header with stats and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-white text-2xl font-bold mb-1">Your Icons</h2>
              <p className="text-white/60">
                {stats.total === 0 ? (
                  'Upload some SVG files to get started'
                ) : (
                  <>
                    <span className="text-white font-semibold">{stats.total}</span> icon{stats.total !== 1 ? 's' : ''} uploaded
                    {stats.painted > 0 && (
                      <span className="ml-2">
                        • <span className="text-green-400 font-semibold">{stats.painted}</span> painted
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Action buttons */}
            {icons.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handlePaintAll}
                  disabled={!selectedBrand}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" />
                  </svg>
                  Paint All
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ZIP
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Drop zone (always visible for adding more files) */}
          <div className={icons.length > 0 ? 'mb-8' : ''}>
            <DropZone onFilesAdded={handleFilesAdded} />
          </div>

          {/* Icon grid */}
          <IconGrid
            icons={icons}
            selectedBrand={selectedBrand}
            onPaint={handlePaintIcon}
            onDownload={handleDownloadIcon}
            onRemove={handleRemoveIcon}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
