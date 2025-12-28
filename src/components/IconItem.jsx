/**
 * IconItem Component
 * Individual icon card with preview, paint action, and download/remove buttons
 * Styled to match Character Studio aesthetic
 */

import { useState, useCallback, useMemo } from 'react';
import { svgToDataUrl } from '../utils/colorMapper';
import { getBrandById } from '../constants/brands';

const IconItem = ({ icon, selectedBrand, isFavorite, onPaint, onDownload, onRemove, onColorModeChange, onToggleFavorite }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // Get the brand that was used to paint this icon
  const paintedBrand = useMemo(() => {
    return icon.paintedWith ? getBrandById(icon.paintedWith) : null;
  }, [icon.paintedWith]);

  // Convert SVG to data URL for preview
  const previewUrl = useMemo(() => {
    return svgToDataUrl(icon.currentContent);
  }, [icon.currentContent]);

  // Handle paint click with animation
  const handlePaintClick = useCallback((e) => {
    if (!selectedBrand || icon.isPainted) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Trigger splash animation
    setShowSplash(true);
    setIsAnimating(true);

    // Perform the paint after a brief delay for visual effect
    setTimeout(() => {
      onPaint(icon.id);
    }, 100);

    // Reset animation states
    setTimeout(() => {
      setShowSplash(false);
      setIsAnimating(false);
    }, 600);
  }, [icon.id, icon.isPainted, selectedBrand, onPaint]);

  // Handle color mode change
  const handleModeChange = useCallback((mode) => {
    if (onColorModeChange && icon.isPainted) {
      onColorModeChange(icon.id, mode);
    }
  }, [icon.id, icon.isPainted, onColorModeChange]);

  const colorMode = icon.colorMode || 'primary';

  return (
    <div
      className={`
        relative group
        bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl
        overflow-hidden
        transition-all duration-300 ease-out
        hover:border-gray-700 hover:shadow-lg hover:shadow-black/40
        ${isAnimating ? 'scale-95' : 'hover:scale-[1.02]'}
      `}
    >
      {/* Paint splash animation overlay */}
      {showSplash && selectedBrand && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-16 h-16 animate-paint-splash"
            style={{ backgroundColor: selectedBrand.primary }}
          />
        </div>
      )}

      {/* Painted brand indicator */}
      {icon.isPainted && paintedBrand && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 animate-fade-in">
          <div
            className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-lg border"
            style={{
              backgroundColor: `${paintedBrand.primary}20`,
              borderColor: `${paintedBrand.primary}40`,
              color: paintedBrand.primary,
            }}
          >
            {paintedBrand.name.split(' ')[0]}
          </div>
        </div>
      )}

      {/* Favorite button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.(icon.id);
        }}
        className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-all duration-200 ${
          isFavorite
            ? 'text-pink-400 opacity-80 hover:opacity-100'
            : 'text-gray-400/40 hover:text-pink-400/60 opacity-0 group-hover:opacity-100'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-3.5 h-3.5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Icon preview - clickable to paint when not painted, clickable to cycle modes when painted */}
      {icon.isPainted ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Cycle through modes: primary → secondary → gradient → primary
            const modes = ['primary', 'secondary', 'gradient'];
            const currentIndex = modes.indexOf(colorMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            handleModeChange(modes[nextIndex]);
          }}
          className="w-full aspect-square p-6 flex items-center justify-center bg-white relative cursor-pointer hover:bg-gray-50 transition-colors"
          title={`Click to cycle color mode (current: ${colorMode})`}
        >
          <img
            src={previewUrl}
            alt={icon.name}
            className="w-full h-full object-contain"
          />
        </button>
      ) : (
        <button
          onClick={handlePaintClick}
          disabled={!selectedBrand}
          type="button"
          className={`
            w-full aspect-square p-6 flex items-center justify-center
            bg-white
            transition-all duration-200
            relative
            ${selectedBrand ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'}
          `}
          title={selectedBrand ? `Click to paint with ${selectedBrand.name}` : 'Select a paint bucket first'}
        >
          <img
            src={previewUrl}
            alt={icon.name}
            className={`
              w-full h-full object-contain
              transition-transform duration-300
              ${isAnimating ? 'scale-90 opacity-50' : 'group-hover:scale-105'}
            `}
          />

          {/* Paint cursor overlay when brand is selected */}
          {selectedBrand && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 pointer-events-none">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-pulse-soft border-2"
                style={{
                  backgroundColor: `${selectedBrand.primary}20`,
                  borderColor: selectedBrand.primary,
                }}
              >
                <svg className="w-6 h-6" fill={selectedBrand.primary} viewBox="0 0 24 24">
                  <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" />
                </svg>
              </div>
            </div>
          )}
        </button>
      )}

      {/* Icon info and actions */}
      <div className="p-3 border-t border-gray-800">
        {/* Filename */}
        <p className="text-gray-400 text-xs font-medium truncate mb-2" title={icon.name}>
          {icon.name}
        </p>

        {/* Color mode toggle - only show when painted */}
        {icon.isPainted && paintedBrand && (
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleModeChange('primary');
              }}
              className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                colorMode === 'primary'
                  ? 'text-gray-900'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
              style={colorMode === 'primary' ? { backgroundColor: paintedBrand.primary } : {}}
              title="Primary color"
            >
              Primary
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleModeChange('secondary');
              }}
              className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                colorMode === 'secondary'
                  ? 'text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
              style={colorMode === 'secondary' ? { backgroundColor: paintedBrand.secondary } : {}}
              title="Secondary color"
            >
              Secondary
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleModeChange('gradient');
              }}
              className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                colorMode === 'gradient'
                  ? 'text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
              style={colorMode === 'gradient' ? {
                background: `linear-gradient(135deg, ${paintedBrand.primary} 0%, ${paintedBrand.secondary} 100%)`
              } : {}}
              title="Gradient"
            >
              GR
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Download button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(icon);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Download icon"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Save</span>
          </button>

          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(icon.id);
            }}
            className="flex items-center justify-center px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-lg transition-all duration-200"
            title="Remove icon"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconItem;
