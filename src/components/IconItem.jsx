/**
 * IconItem Component
 * Individual icon card with preview, paint action, and download/remove buttons
 */

import { useState, useCallback, useMemo } from 'react';
import { svgToDataUrl } from '../utils/colorMapper';
import { getBrandById } from '../constants/brands';

const IconItem = ({ icon, selectedBrand, onPaint, onDownload, onRemove }) => {
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
  const handlePaintClick = useCallback(() => {
    if (!selectedBrand) return;

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
  }, [icon.id, selectedBrand, onPaint]);

  return (
    <div
      className={`
        relative group
        bg-white/10 backdrop-blur-sm rounded-xl
        overflow-hidden
        transition-all duration-300 ease-out
        hover:bg-white/15 hover:shadow-lg hover:shadow-black/20
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
        <div
          className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg animate-fade-in"
          style={{
            backgroundColor: paintedBrand.primary,
            color: paintedBrand.secondary === '#000000' || paintedBrand.secondary === '#002B49'
              ? 'white'
              : paintedBrand.secondary,
          }}
        >
          {paintedBrand.name.split(' ')[0]}
        </div>
      )}

      {/* Icon preview - clickable to paint */}
      <button
        onClick={handlePaintClick}
        disabled={!selectedBrand}
        className={`
          w-full aspect-square p-6 flex items-center justify-center
          bg-white/5 hover:bg-white/10
          transition-all duration-200
          ${selectedBrand ? 'cursor-pointer' : 'cursor-default'}
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
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-pulse-soft"
              style={{ backgroundColor: selectedBrand.primary }}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" />
              </svg>
            </div>
          </div>
        )}
      </button>

      {/* Icon info and actions */}
      <div className="p-3 border-t border-white/10">
        {/* Filename */}
        <p className="text-white/80 text-xs font-medium truncate mb-2" title={icon.name}>
          {icon.name}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Download button */}
          <button
            onClick={() => onDownload(icon)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200 text-xs font-medium"
            title="Download icon"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Save</span>
          </button>

          {/* Remove button */}
          <button
            onClick={() => onRemove(icon.id)}
            className="flex items-center justify-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
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
