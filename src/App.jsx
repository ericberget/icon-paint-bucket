/**
 * Main App Component
 * Icon Paint Bucket - SVG Recoloring Tool
 * Styled to match Character Studio aesthetic
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import DropZone from './components/DropZone';
import PaintBucket from './components/PaintBucket';
import IconGrid from './components/IconGrid';
import LibraryDrawer from './components/LibraryDrawer';
import { BRANDS, DEFAULT_BRAND_ID, getBrandById } from './constants/brands';
import { recolorSvg } from './utils/colorMapper';
import { processSvgFiles, downloadSvg, downloadAsZip } from './utils/fileHandler';
import { saveIcons, loadIcons } from './utils/iconStorage';

// LocalStorage keys for persisting state
const STORAGE_KEY = 'icon-paint-bucket-brand';
const CUSTOM_COLORS_KEY = 'icon-paint-bucket-custom-colors';
const FAVORITES_KEY = 'icon-paint-bucket-favorites';

// Default custom brand colors
const DEFAULT_CUSTOM_COLORS = {
  primary: '#1E40AF',
  secondary: '#64748B',
  accent: '#E2E8F0',
};

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  }[type];

  return (
    <div className={`
      fixed bottom-4 right-4 z-50
      px-6 py-3 rounded-lg border backdrop-blur-sm
      flex items-center gap-3
      animate-slide-up
      ${bgColor}
    `}>
      {type === 'success' && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      {type === 'info' && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

function App() {
  // State for workspace icons (current session)
  const [icons, setIcons] = useState([]);
  
  // State for library drawer
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryCount, setLibraryCount] = useState(0);

  // State for favorites (icon IDs that are favorited)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // State for filter view (all or favorites)
  const [filterView, setFilterView] = useState('all');

  // State for selected brand (with localStorage persistence)
  const [selectedBrandId, setSelectedBrandId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || DEFAULT_BRAND_ID;
  });

  // State for custom brand colors (with localStorage persistence)
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem(CUSTOM_COLORS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CUSTOM_COLORS;
      }
    }
    return DEFAULT_CUSTOM_COLORS;
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Create brands array with custom colors applied
  const brandsWithCustom = useMemo(() => {
    return BRANDS.map((brand) => {
      if (brand.id === 'custom') {
        return { ...brand, ...customColors };
      }
      return brand;
    });
  }, [customColors]);

  // Get the selected brand object (with custom colors if applicable)
  const selectedBrand = useMemo(() => {
    return brandsWithCustom.find((b) => b.id === selectedBrandId);
  }, [selectedBrandId, brandsWithCustom]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = icons.length;
    const painted = icons.filter((icon) => icon.isPainted).length;
    const favCount = icons.filter((icon) => favorites.has(icon.id)).length;
    return { total, painted, favCount };
  }, [icons, favorites]);

  // Filter icons based on current view
  const filteredIcons = useMemo(() => {
    if (filterView === 'favorites') {
      return icons.filter((icon) => favorites.has(icon.id));
    }
    return icons;
  }, [icons, favorites, filterView]);

  // Persist brand selection to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedBrandId);
  }, [selectedBrandId]);

  // Persist custom colors to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
  }, [customColors]);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  // Load library count on app start
  useEffect(() => {
    const updateLibraryCount = async () => {
      try {
        const storedIcons = await loadIcons();
        setLibraryCount(storedIcons.length);
      } catch (error) {
        console.error('Failed to load library count:', error);
      }
    };
    updateLibraryCount();
  }, []);

  // Handle custom color change
  const handleCustomColorChange = useCallback((colorType, value) => {
    setCustomColors((prev) => ({
      ...prev,
      [colorType]: value,
    }));
  }, []);

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
      
      // Add to workspace
      setIcons((prev) => [...prev, ...newIcons]);
      
      // Also save to library (IndexedDB)
      const existingIcons = await loadIcons();
      const existingIds = new Set(existingIcons.map((i) => i.id));
      const uniqueNewIcons = newIcons.filter((icon) => !existingIds.has(icon.id));
      
      if (uniqueNewIcons.length > 0) {
        await saveIcons([...existingIcons, ...uniqueNewIcons]);
        setLibraryCount(existingIcons.length + uniqueNewIcons.length);
      }
      
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

        const recolored = recolorSvg(icon.originalContent, selectedBrand, 'primary');

        return {
          ...icon,
          currentContent: recolored,
          paintedWith: selectedBrand.id,
          isPainted: true,
          colorMode: 'primary',
        };
      })
    );

    showToast(`Painted with ${selectedBrand.name}!`, 'success');
  }, [selectedBrand, showToast]);

  // Handle color mode change for a painted icon
  const handleColorModeChange = useCallback((iconId, mode) => {
    setIcons((prev) =>
      prev.map((icon) => {
        if (icon.id !== iconId) return icon;
        if (!icon.isPainted || !icon.paintedWith) return icon;

        // Get the brand that was used to paint this icon
        const brand = brandsWithCustom.find((b) => b.id === icon.paintedWith);
        if (!brand) return icon;

        const recolored = recolorSvg(icon.originalContent, brand, mode);

        return {
          ...icon,
          currentContent: recolored,
          colorMode: mode,
        };
      })
    );
  }, [brandsWithCustom]);

  // Handle downloading a single icon
  const handleDownloadIcon = useCallback((icon) => {
    downloadSvg(icon.currentContent, icon.name);
    showToast(`Downloaded ${icon.name}`, 'success');
  }, [showToast]);

  // Handle removing a single icon
  const handleRemoveIcon = useCallback((iconId) => {
    setIcons((prev) => prev.filter((icon) => icon.id !== iconId));
    // Also remove from favorites
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(iconId);
      return next;
    });
  }, []);

  // Handle toggling favorite status
  const handleToggleFavorite = useCallback((iconId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(iconId)) {
        next.delete(iconId);
      } else {
        next.add(iconId);
      }
      return next;
    });
  }, []);

  // Handle adding icon from library to workspace
  const handleAddFromLibrary = useCallback((icon) => {
    // Check if already in workspace
    const exists = icons.some((i) => i.id === icon.id);
    if (exists) {
      showToast(`${icon.name} is already in workspace`, 'info');
      return;
    }
    
    // Add to workspace (use original content, not painted)
    setIcons((prev) => [...prev, {
      ...icon,
      currentContent: icon.originalContent,
      isPainted: false,
      paintedWith: null,
      colorMode: null,
    }]);
    
    showToast(`Added ${icon.name} to workspace`, 'success');
  }, [icons, showToast]);

  // Get set of workspace icon IDs for library to check
  const workspaceIconIds = useMemo(() => {
    return new Set(icons.map((i) => i.id));
  }, [icons]);

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
        const recolored = recolorSvg(icon.originalContent, selectedBrand, 'primary');
        return {
          ...icon,
          currentContent: recolored,
          paintedWith: selectedBrand.id,
          isPainted: true,
          colorMode: 'primary',
        };
      })
    );

    showToast(`Painted all icons with ${selectedBrand.name}!`, 'success');
  }, [selectedBrand, icons, showToast]);

  // Handle clearing workspace (not library)
  const handleClearAll = useCallback(() => {
    setIcons([]);
    showToast('Cleared workspace', 'info');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative flex flex-col lg:flex-row min-h-screen">
        {/* Left sidebar - Paint Buckets */}
        <aside className="w-full lg:w-96 p-6 bg-gray-950/60 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-gray-800 lg:min-h-screen">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/logo-iconzap.png"
              alt="Icon Zap"
              className="h-14 w-auto"
            />
            <p className="text-gray-500 text-sm mt-2">SVG Recoloring Tool</p>
          </div>

          {/* Paint bucket selector */}
          <div className="space-y-3 mb-8">
            <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Select Brand Colors
            </h2>
            {brandsWithCustom.map((brand) => (
              <PaintBucket
                key={brand.id}
                brand={brand}
                isSelected={selectedBrandId === brand.id}
                isCustom={brand.id === 'custom'}
                onClick={() => handleBrandSelect(brand.id)}
                onColorChange={brand.id === 'custom' ? handleCustomColorChange : undefined}
              />
            ))}
          </div>

          {/* Instructions */}
          <div className="glass-card p-4">
            <h3 className="text-gray-300 text-sm font-semibold mb-3">How to use</h3>
            <ol className="text-gray-500 text-xs space-y-2 list-decimal list-inside">
              <li>Select a brand color palette above</li>
              <li>Drop your SVG files in the upload area</li>
              <li>Click on icons to paint them</li>
              <li>Download individually or as a ZIP</li>
            </ol>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 lg:p-8 relative">
          {/* Header with stats and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-white text-3xl font-header font-bold tracking-wide mb-1">Dropzone</h2>
              <p className="text-gray-500">
                {stats.total === 0 ? (
                  'Upload SVGs or add from Library'
                ) : (
                  <>
                    <span className="text-white font-semibold">{stats.total}</span> icon{stats.total !== 1 ? 's' : ''} uploaded
                    {stats.painted > 0 && (
                      <span className="ml-2">
                        • <span className="text-yellow-400 font-semibold">{stats.painted}</span> painted
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Library button - always visible */}
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Library ({libraryCount})
              </button>

              {icons.length > 0 && (
                <>
                  <button
                    onClick={handlePaintAll}
                    disabled={!selectedBrand}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-500 font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-yellow-500/25 disabled:shadow-none"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" />
                    </svg>
                    Paint All
                  </button>
                <button
                  onClick={handleDownloadAll}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ZIP
                </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-medium text-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Drop zone (always visible for adding more files) */}
          <div className={icons.length > 0 ? 'mb-6' : ''}>
            <DropZone onFilesAdded={handleFilesAdded} />
          </div>

          {/* Filter bar */}
          {icons.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFilterView('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterView === 'all'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterView('favorites')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  filterView === 'favorites'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Favorites ({stats.favCount})
              </button>
            </div>
          )}

          {/* Icon grid */}
          <IconGrid
            icons={filteredIcons}
            selectedBrand={selectedBrand}
            favorites={favorites}
            onPaint={handlePaintIcon}
            onDownload={handleDownloadIcon}
            onRemove={handleRemoveIcon}
            onColorModeChange={handleColorModeChange}
            onToggleFavorite={handleToggleFavorite}
          />
        </main>
      </div>

      {/* Library Drawer */}
      <LibraryDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddToWorkspace={handleAddFromLibrary}
        workspaceIconIds={workspaceIconIds}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

export default App;
