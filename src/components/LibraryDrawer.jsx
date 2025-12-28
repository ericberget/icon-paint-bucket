/**
 * LibraryDrawer Component
 * Slide-out panel showing saved icons from IndexedDB
 * Users can click to add icons to their current workspace
 */

import { useState, useEffect, useMemo } from 'react';
import { loadIcons, deleteIcon as deleteIconFromStorage } from '../utils/iconStorage';
import { svgToDataUrl } from '../utils/colorMapper';

const LibraryDrawer = ({ isOpen, onClose, onAddToWorkspace, workspaceIconIds, favorites, onToggleFavorite }) => {
  const [libraryIcons, setLibraryIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'favorites'
  const [searchQuery, setSearchQuery] = useState('');

  // Load icons from IndexedDB when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadLibrary();
    }
  }, [isOpen]);

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

  // Filter icons based on search and favorites
  const filteredIcons = useMemo(() => {
    let result = libraryIcons;

    // Filter by favorites
    if (filter === 'favorites') {
      result = result.filter((icon) => favorites?.has(icon.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((icon) => icon.name.toLowerCase().includes(query));
    }

    return result;
  }, [libraryIcons, filter, searchQuery, favorites]);

  // Check if icon is already in workspace
  const isInWorkspace = (iconId) => workspaceIconIds?.has(iconId);

  // Handle adding icon to workspace
  const handleAddToWorkspace = (icon) => {
    if (!isInWorkspace(icon.id)) {
      onAddToWorkspace(icon);
    }
  };

  // Handle deleting icon from library
  const handleDeleteFromLibrary = async (e, iconId) => {
    e.stopPropagation();
    try {
      await deleteIconFromStorage(iconId);
      setLibraryIcons((prev) => prev.filter((icon) => icon.id !== iconId));
    } catch (error) {
      console.error('Failed to delete icon:', error);
    }
  };

  // Stats
  const totalCount = libraryIcons.length;
  const favCount = libraryIcons.filter((icon) => favorites?.has(icon.id)).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-white text-lg font-semibold">Icon Library</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                filter === 'favorites'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Favorites ({favCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Loading library...
            </div>
          ) : filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">
                {filter === 'favorites' ? 'No favorites yet' : searchQuery ? 'No icons match your search' : 'Library is empty'}
              </p>
              <p className="text-xs mt-1 opacity-75">
                {filter !== 'favorites' && !searchQuery && 'Upload icons to build your library'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredIcons.map((icon) => {
                const inWorkspace = isInWorkspace(icon.id);
                const isFav = favorites?.has(icon.id);
                
                return (
                  <div
                    key={icon.id}
                    onClick={() => handleAddToWorkspace(icon)}
                    className={`
                      relative group rounded-lg overflow-hidden border transition-all cursor-pointer
                      ${inWorkspace
                        ? 'border-green-500/50 bg-green-500/10 opacity-60'
                        : 'border-gray-700 bg-gray-800 hover:border-yellow-500/50 hover:bg-gray-750'
                      }
                    `}
                    title={inWorkspace ? 'Already in workspace' : `Click to add "${icon.name}" to workspace`}
                  >
                    {/* Icon preview */}
                    <div className="aspect-square p-3 bg-white flex items-center justify-center">
                      <img
                        src={svgToDataUrl(icon.originalContent)}
                        alt={icon.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Icon name */}
                    <div className="p-2 text-center">
                      <p className="text-[10px] text-gray-400 truncate" title={icon.name}>
                        {icon.name}
                      </p>
                    </div>

                    {/* In workspace indicator */}
                    {inWorkspace && (
                      <div className="absolute top-1 left-1 p-1 bg-green-500 rounded-full">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(icon.id);
                      }}
                      className={`absolute top-1 right-1 p-1 rounded-full transition-all ${
                        isFav
                          ? 'text-pink-400 opacity-100'
                          : 'text-gray-400/50 opacity-0 group-hover:opacity-100 hover:text-pink-400'
                      }`}
                    >
                      <svg className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteFromLibrary(e, icon.id)}
                      className="absolute bottom-8 right-1 p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                      title="Remove from library"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="p-3 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Click an icon to add it to your workspace
          </p>
        </div>
      </div>
    </>
  );
};

export default LibraryDrawer;

