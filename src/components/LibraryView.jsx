/**
 * LibraryView Component
 * Full-page library view for browsing, filtering, and organizing icons
 */

import { useState, useEffect, useMemo } from 'react';
import { loadIcons, saveIcons, deleteIcon as deleteIconFromStorage } from '../utils/iconStorage';
import { svgToDataUrl } from '../utils/colorMapper';
import { BRANDS } from '../constants/brands';

// Style tag options
const STYLE_TAGS = [
  { id: 'thick-line', label: 'Thick Line' },
  { id: 'thin-line', label: 'Thin Line' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'square', label: 'Square' },
  { id: 'outline', label: 'Outline' },
  { id: 'filled', label: 'Filled' },
  { id: 'duotone', label: 'Duotone' },
];

const LibraryView = ({ onBack, onAddToWorkspace, favorites, onToggleFavorite }) => {
  const [libraryIcons, setLibraryIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [brandFilter, setBrandFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Tag editing
  const [editingIconId, setEditingIconId] = useState(null);

  // Load icons from IndexedDB
  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setIsLoading(true);
    try {
      const icons = await loadIcons();
      setLibraryIcons(icons);
    } catch (error) {
      console.error('Failed to load library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort icons
  const filteredIcons = useMemo(() => {
    let result = [...libraryIcons];

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((icon) => favorites?.has(icon.id));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((icon) => icon.name.toLowerCase().includes(query));
    }

    // Brand filter
    if (brandFilter !== 'all') {
      result = result.filter((icon) => icon.paintedWith === brandFilter);
    }

    // Style filter
    if (styleFilter !== 'all') {
      result = result.filter((icon) => icon.tags?.includes(styleFilter));
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        // Most recently added first (assuming higher ID = more recent, or use uploadedAt if available)
        result.sort((a, b) => (b.uploadedAt || b.id || '').localeCompare(a.uploadedAt || a.id || ''));
        break;
      case 'oldest':
        result.sort((a, b) => (a.uploadedAt || a.id || '').localeCompare(b.uploadedAt || b.id || ''));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'favorites':
        result.sort((a, b) => {
          const aFav = favorites?.has(a.id) ? 1 : 0;
          const bFav = favorites?.has(b.id) ? 1 : 0;
          return bFav - aFav;
        });
        break;
      default:
        break;
    }

    return result;
  }, [libraryIcons, searchQuery, brandFilter, styleFilter, sortBy, favorites, showFavoritesOnly]);

  // Handle adding tag to icon
  const handleAddTag = async (iconId, tagId) => {
    const updatedIcons = libraryIcons.map((icon) => {
      if (icon.id !== iconId) return icon;
      const currentTags = icon.tags || [];
      if (currentTags.includes(tagId)) return icon;
      return { ...icon, tags: [...currentTags, tagId] };
    });
    setLibraryIcons(updatedIcons);
    await saveIcons(updatedIcons);
  };

  // Handle removing tag from icon
  const handleRemoveTag = async (iconId, tagId) => {
    const updatedIcons = libraryIcons.map((icon) => {
      if (icon.id !== iconId) return icon;
      return { ...icon, tags: (icon.tags || []).filter((t) => t !== tagId) };
    });
    setLibraryIcons(updatedIcons);
    await saveIcons(updatedIcons);
  };

  // Handle delete icon
  const handleDeleteIcon = async (iconId) => {
    try {
      await deleteIconFromStorage(iconId);
      setLibraryIcons((prev) => prev.filter((icon) => icon.id !== iconId));
    } catch (error) {
      console.error('Failed to delete icon:', error);
    }
  };

  // Get brand name by ID
  const getBrandName = (brandId) => {
    const brand = BRANDS.find((b) => b.id === brandId);
    return brand?.name?.split(' ')[0] || brandId;
  };

  // Get brand color by ID
  const getBrandColor = (brandId) => {
    const brand = BRANDS.find((b) => b.id === brandId);
    return brand?.primary || '#888';
  };

  // Stats
  const stats = {
    total: libraryIcons.length,
    painted: libraryIcons.filter((i) => i.isPainted).length,
    favorites: libraryIcons.filter((i) => favorites?.has(i.id)).length,
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Workspace</span>
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Icon Library
            </h1>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-neutral-400">
                <span className="text-white font-semibold">{stats.total}</span> icons
              </span>
              <span className="text-neutral-400">
                <span className="text-yellow-400 font-semibold">{stats.painted}</span> painted
              </span>
              <span className="text-neutral-400">
                <span className="text-pink-400 font-semibold">{stats.favorites}</span> favorites
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters bar */}
      <div className="sticky top-[73px] z-10 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Favorites toggle - prominent button */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                showFavoritesOnly
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-pink-400 border border-neutral-700'
              }`}
            >
              <svg className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Favorites
              {stats.favorites > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                  showFavoritesOnly ? 'bg-white/20' : 'bg-pink-500/20 text-pink-400'
                }`}>
                  {stats.favorites}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Brand filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="all">All Brands</option>
              {BRANDS.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>

            {/* Style filter */}
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="all">All Styles</option>
              {STYLE_TAGS.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.label}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="favorites">Favorites First</option>
            </select>

            {/* Results count */}
            <span className="text-sm text-neutral-500">
              Showing {filteredIcons.length} of {libraryIcons.length}
            </span>
          </div>
        </div>
      </div>

      {/* Icon grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading library...
            </div>
          </div>
        ) : filteredIcons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium">No icons found</p>
            <p className="text-sm mt-1">
              {libraryIcons.length === 0 
                ? 'Upload some icons to get started' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredIcons.map((icon) => {
              const isFav = favorites?.has(icon.id);
              const isEditing = editingIconId === icon.id;
              
              return (
                <div
                  key={icon.id}
                  className="group relative bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all"
                >
                  {/* Icon preview */}
                  <button
                    onClick={() => onAddToWorkspace(icon)}
                    className="w-full aspect-square p-4 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    title="Add to workspace"
                  >
                    <img
                      src={svgToDataUrl(icon.currentContent || icon.originalContent)}
                      alt={icon.name}
                      className="w-full h-full object-contain"
                    />
                  </button>

                  {/* Brand badge */}
                  {icon.isPainted && icon.paintedWith && (
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: `${getBrandColor(icon.paintedWith)}20`,
                        color: getBrandColor(icon.paintedWith),
                        borderColor: `${getBrandColor(icon.paintedWith)}40`,
                        borderWidth: 1,
                      }}
                    >
                      {getBrandName(icon.paintedWith)}
                    </div>
                  )}

                  {/* Favorite button */}
                  <button
                    onClick={() => onToggleFavorite?.(icon.id)}
                    className={`absolute top-2 right-2 p-1 rounded-full transition-all ${
                      isFav
                        ? 'text-pink-400'
                        : 'text-neutral-400/50 opacity-0 group-hover:opacity-100 hover:text-pink-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  {/* Info section */}
                  <div className="p-3">
                    {/* Name */}
                    <p className="text-neutral-400 text-xs font-medium truncate mb-2" title={icon.name}>
                      {icon.name}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
                      {(icon.tags || []).map((tagId) => {
                        const tag = STYLE_TAGS.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-[9px] rounded flex items-center gap-1"
                          >
                            {tag.label}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveTag(icon.id, tagId)}
                                className="hover:text-red-400"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ) : null;
                      })}
                      
                      {/* Add tag button */}
                      {isEditing && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddTag(icon.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-1 py-0.5 bg-neutral-800 text-neutral-400 text-[9px] rounded border-0 focus:ring-1 focus:ring-yellow-500"
                          defaultValue=""
                        >
                          <option value="">+ Tag</option>
                          {STYLE_TAGS.filter((t) => !(icon.tags || []).includes(t.id)).map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.label}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => onAddToWorkspace(icon)}
                        className="flex-1 px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 rounded text-[10px] font-medium transition-colors"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setEditingIconId(isEditing ? null : icon.id)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          isEditing
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                        title="Edit tags"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteIcon(icon.id)}
                        className="px-2 py-1 bg-neutral-800 text-neutral-400 hover:bg-red-500/20 hover:text-red-400 rounded text-[10px] font-medium transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LibraryView;

