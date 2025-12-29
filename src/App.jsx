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
import LibraryView from './components/LibraryView';
import { BRANDS, DEFAULT_BRAND_ID, getBrandById } from './constants/brands';
import { recolorSvg } from './utils/colorMapper';
import { processSvgFiles, downloadSvg, downloadAsZip } from './utils/fileHandler';
import { saveIcons, loadIcons } from './utils/iconStorage';

// LocalStorage keys for persisting state
const STORAGE_KEY = 'icon-paint-bucket-brand';
const BRAND_OVERRIDES_KEY = 'icon-paint-bucket-brand-overrides';
const DELETED_BRANDS_KEY = 'icon-paint-bucket-deleted-brands';
const FAVORITES_KEY = 'icon-paint-bucket-favorites';
const CUSTOM_BRANDS_KEY = 'icon-paint-bucket-custom-brands';
const CUSTOM_COLOR_KEY = 'icon-paint-bucket-custom-color';

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
  
  // State for current view (workspace or library)
  const [currentView, setCurrentView] = useState('workspace');
  
  // State for library drawer (legacy, keeping for now)
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

  // State for brand color overrides (any brand can be edited)
  const [brandOverrides, setBrandOverrides] = useState(() => {
    const saved = localStorage.getItem(BRAND_OVERRIDES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // State for deleted brand IDs
  const [deletedBrands, setDeletedBrands] = useState(() => {
    const saved = localStorage.getItem(DELETED_BRANDS_KEY);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // State for custom color (quick one-off color picker)
  const [customColor, setCustomColor] = useState(() => {
    return localStorage.getItem(CUSTOM_COLOR_KEY) || '#FFFFFF';
  });
  const [isCustomColorSelected, setIsCustomColorSelected] = useState(false);

  // State for user-created brands (saved to localStorage)
  const [customBrands, setCustomBrands] = useState(() => {
    const saved = localStorage.getItem(CUSTOM_BRANDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // State for "Add New Brand" form
  const [showAddBrandForm, setShowAddBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandPrimary, setNewBrandPrimary] = useState('#3B82F6');
  const [newBrandSecondary, setNewBrandSecondary] = useState('#1E3A5F');
  const [newBrandAccent, setNewBrandAccent] = useState('#E5E7EB');

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Create brands array with overrides applied, deleted brands filtered out, and custom brands added
  const brandsWithOverrides = useMemo(() => {
    const defaultBrands = BRANDS
      .filter((brand) => !deletedBrands.has(brand.id))
      .map((brand) => {
        const override = brandOverrides[brand.id];
        if (override) {
          return { ...brand, ...override };
        }
        return brand;
      });
    
    // Add custom brands at the end
    return [...defaultBrands, ...customBrands];
  }, [brandOverrides, deletedBrands, customBrands]);

  // Get the selected brand object (with overrides if applicable)
  // If custom color is selected, create a virtual brand for it
  const selectedBrand = useMemo(() => {
    if (isCustomColorSelected) {
      return {
        id: 'custom-color',
        name: 'Custom',
        primary: customColor,
        secondary: customColor,
        accent: '#F5F5F5',
      };
    }
    return brandsWithOverrides.find((b) => b.id === selectedBrandId);
  }, [selectedBrandId, brandsWithOverrides, isCustomColorSelected, customColor]);

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

  // Persist brand overrides to localStorage
  useEffect(() => {
    localStorage.setItem(BRAND_OVERRIDES_KEY, JSON.stringify(brandOverrides));
  }, [brandOverrides]);

  // Persist deleted brands to localStorage
  useEffect(() => {
    localStorage.setItem(DELETED_BRANDS_KEY, JSON.stringify([...deletedBrands]));
  }, [deletedBrands]);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  // Persist custom color to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_COLOR_KEY, customColor);
  }, [customColor]);

  // Persist custom brands to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_BRANDS_KEY, JSON.stringify(customBrands));
  }, [customBrands]);

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

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Handle brand color change (for any brand)
  const handleBrandColorChange = useCallback((brandId, colorType, value) => {
    setBrandOverrides((prev) => ({
      ...prev,
      [brandId]: {
        ...(prev[brandId] || {}),
        [colorType]: value,
      },
    }));
  }, []);

  // Handle brand deletion
  const handleDeleteBrand = useCallback((brandId) => {
    setDeletedBrands((prev) => {
      const next = new Set(prev);
      next.add(brandId);
      return next;
    });
    // If the deleted brand was selected, select the first available brand
    if (selectedBrandId === brandId) {
      const remainingBrands = BRANDS.filter((b) => !deletedBrands.has(b.id) && b.id !== brandId);
      if (remainingBrands.length > 0) {
        setSelectedBrandId(remainingBrands[0].id);
      }
    }
    showToast('Brand deleted', 'info');
  }, [selectedBrandId, deletedBrands, showToast]);

  // Handle brand reset to default
  const handleResetBrand = useCallback((brandId) => {
    setBrandOverrides((prev) => {
      const next = { ...prev };
      delete next[brandId];
      return next;
    });
    showToast('Brand reset to default', 'success');
  }, [showToast]);

  // Handle brand selection
  const handleBrandSelect = useCallback((brandId) => {
    setSelectedBrandId(brandId);
    setIsCustomColorSelected(false);
    const brand = brandsWithOverrides.find((b) => b.id === brandId) || getBrandById(brandId);
    if (brand) {
      showToast(`Selected ${brand.name}`, 'info');
    }
  }, [showToast, brandsWithOverrides]);

  // Handle custom color selection
  const handleCustomColorSelect = useCallback(() => {
    setIsCustomColorSelected(true);
    showToast(`Using custom color: ${customColor}`, 'info');
  }, [showToast, customColor]);

  // Handle custom color change
  const handleCustomColorChange = useCallback((color) => {
    setCustomColor(color);
    setIsCustomColorSelected(true);
  }, []);

  // Handle adding a new brand
  const handleAddNewBrand = useCallback(() => {
    if (!newBrandName.trim()) {
      showToast('Please enter a brand name', 'error');
      return;
    }
    
    const newBrand = {
      id: `custom-${Date.now()}`,
      name: newBrandName.trim(),
      primary: newBrandPrimary,
      secondary: newBrandSecondary,
      accent: newBrandAccent,
      isCustom: true,
    };
    
    setCustomBrands((prev) => [...prev, newBrand]);
    setShowAddBrandForm(false);
    setNewBrandName('');
    setNewBrandPrimary('#3B82F6');
    setNewBrandSecondary('#1E3A5F');
    setNewBrandAccent('#E5E7EB');
    setSelectedBrandId(newBrand.id);
    setIsCustomColorSelected(false);
    showToast(`Created "${newBrand.name}" brand`, 'success');
  }, [newBrandName, newBrandPrimary, newBrandSecondary, newBrandAccent, showToast]);

  // Handle file uploads
  const handleFilesAdded = useCallback(async (files, uploadOptions = {}) => {
    // Handle both old format (array of tags) and new format (options object)
    const options = Array.isArray(uploadOptions) 
      ? { tags: uploadOptions, isCustomBrand: false, customBrandId: null }
      : uploadOptions;
    
    const { tags = [], isCustomBrand = false, customBrandId = null } = options;
    
    try {
      const newIcons = await processSvgFiles(files);
      if (newIcons.length === 0) {
        showToast('No valid SVG files found', 'error');
        return;
      }
      
      // Apply tags and custom brand info to new icons
      const iconsWithMetadata = newIcons.map((icon) => ({
        ...icon,
        tags: tags.length > 0 ? [...tags] : [],
        isCustomBrand: isCustomBrand,
        customBrandId: isCustomBrand ? customBrandId : null,
        // Custom brand icons are pre-painted and locked
        isPainted: isCustomBrand,
        paintedWith: isCustomBrand ? customBrandId : null,
        isLocked: isCustomBrand,
      }));
      
      // Add to workspace
      setIcons((prev) => [...prev, ...iconsWithMetadata]);
      
      // Also save to library (IndexedDB)
      const existingIcons = await loadIcons();
      const existingIds = new Set(existingIcons.map((i) => i.id));
      const uniqueNewIcons = iconsWithMetadata.filter((icon) => !existingIds.has(icon.id));
      
      if (uniqueNewIcons.length > 0) {
        await saveIcons([...existingIcons, ...uniqueNewIcons]);
        setLibraryCount(existingIcons.length + uniqueNewIcons.length);
      }
      
      const tagMsg = tags.length > 0 ? ` with ${tags.length} tag${tags.length > 1 ? 's' : ''}` : '';
      const brandMsg = isCustomBrand ? ' (Custom Brand - locked)' : '';
      showToast(`Added ${newIcons.length} icon${newIcons.length > 1 ? 's' : ''}${tagMsg}${brandMsg}`, 'success');
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
        const brand = brandsWithOverrides.find((b) => b.id === icon.paintedWith);
        if (!brand) return icon;

        const recolored = recolorSvg(icon.originalContent, brand, mode);

        return {
          ...icon,
          currentContent: recolored,
          colorMode: mode,
        };
      })
    );
  }, [brandsWithOverrides]);

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

  // Handle switching back from library view
  const handleBackFromLibrary = useCallback(() => {
    setCurrentView('workspace');
    // Refresh library count
    loadIcons().then((icons) => setLibraryCount(icons.length));
  }, []);

  // Handle adding icon from library to workspace
  const handleAddFromLibraryView = useCallback((icon) => {
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
    
    setCurrentView('workspace');
    showToast(`Added ${icon.name} to workspace`, 'success');
  }, [icons, showToast]);

  // Render Library View if in library mode
  if (currentView === 'library') {
    return (
      <LibraryView
        onBack={handleBackFromLibrary}
        onAddToWorkspace={handleAddFromLibraryView}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundRepeat: 'repeat',
      }}
    >


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
        <aside 
          className="w-full lg:w-96 p-6 border-b lg:border-b-0 lg:border-r border-gray-800 lg:min-h-screen"
          style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundRepeat: 'repeat',
          }}
        >
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
            
            {/* Quick Custom Color Picker */}
            <div
              onClick={handleCustomColorSelect}
              className={`
                relative w-full p-3 rounded-xl cursor-pointer
                transition-all duration-300 ease-out
                ${isCustomColorSelected
                  ? 'bg-neutral-800 border-2 border-yellow-400 shadow-lg shadow-yellow-500/25'
                  : 'bg-neutral-900/50 border border-neutral-700 hover:bg-neutral-800/50 hover:border-neutral-600'
                }
              `}
            >
              {isCustomColorSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${isCustomColorSelected ? 'text-yellow-400' : 'text-gray-300'}`}>
                    Custom
                  </h4>
                  <p className="text-[10px] text-gray-500">Quick one-off color</p>
                </div>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  title="Pick a color"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-600 rounded text-xs text-neutral-300 font-mono focus:ring-1 focus:ring-yellow-500"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-700 my-4" />

            {/* Brand list */}
            {brandsWithOverrides.map((brand) => (
              <PaintBucket
                key={brand.id}
                brand={brand}
                isSelected={!isCustomColorSelected && selectedBrandId === brand.id}
                isEdited={!!brandOverrides[brand.id]}
                onClick={() => handleBrandSelect(brand.id)}
                onColorChange={handleBrandColorChange}
                onDelete={handleDeleteBrand}
                onReset={handleResetBrand}
              />
            ))}

            {/* Add New Brand CTA */}
            {!showAddBrandForm ? (
              <button
                onClick={() => setShowAddBrandForm(true)}
                className="w-full p-3 rounded-xl border-2 border-dashed border-neutral-600 hover:border-yellow-500/50 bg-neutral-900/30 hover:bg-neutral-800/50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center gap-2 text-neutral-400 group-hover:text-yellow-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium text-sm">Add New Brand</span>
                </div>
              </button>
            ) : (
              <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl space-y-3 animate-fade-in">
                <h4 className="text-sm font-semibold text-white">Create New Brand</h4>
                
                {/* Brand name input */}
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Brand name..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-lg text-sm text-neutral-300 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                />
                
                {/* Color pickers */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={newBrandPrimary}
                      onChange={(e) => setNewBrandPrimary(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[9px] text-gray-500 uppercase">Primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={newBrandSecondary}
                      onChange={(e) => setNewBrandSecondary(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[9px] text-gray-500 uppercase">Secondary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={newBrandAccent}
                      onChange={(e) => setNewBrandAccent(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[9px] text-gray-500 uppercase">Accent</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddBrandForm(false)}
                    className="flex-1 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg text-xs font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewBrand}
                    className="flex-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 rounded-lg text-xs font-medium transition-all"
                  >
                    Save Brand
                  </button>
                </div>
              </div>
            )}
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
                onClick={() => setCurrentView('library')}
                className="px-4 py-2 rounded-lg bg-[#F5D547] hover:bg-[#E5C537] text-gray-900 font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-yellow-500/25"
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
            <DropZone onFilesAdded={handleFilesAdded} brands={brandsWithOverrides} />
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
