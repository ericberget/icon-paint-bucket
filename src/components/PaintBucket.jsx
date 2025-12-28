/**
 * PaintBucket Component
 * Visual paint bucket selector for brand colors
 * Supports editing colors for any brand and delete/reset
 */

import { useState } from 'react';

const PaintBucket = ({ brand, isSelected, isEdited, onClick, onColorChange, onDelete, onReset }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Handle color input change
  const handleColorChange = (colorType, value) => {
    if (onColorChange) {
      onColorChange(brand.id, colorType, value);
    }
  };

  // Toggle edit mode
  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(brand.id);
    }
    setIsEditing(false);
  };

  // Handle reset to default
  const handleReset = (e) => {
    e.stopPropagation();
    if (onReset) {
      onReset(brand.id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          relative w-full p-4 rounded-xl
          transition-all duration-300 ease-out
          group
          ${isSelected
            ? 'bg-gray-800 border-2 border-yellow-400 shadow-lg shadow-yellow-500/25'
            : 'bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 hover:border-gray-700'
          }
        `}
      >
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
            <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Edited indicator */}
        {isEdited && !isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full" title="Edited" />
        )}

        {/* Brand name and edit button */}
        <div className="flex items-center gap-3 mb-3">
          {/* Brand name */}
          <div className="flex-1 text-left">
            <h4 className={`
              font-semibold text-sm
              transition-colors duration-300
              ${isSelected ? 'text-yellow-400' : 'text-gray-300 group-hover:text-white'}
            `}>
              {brand.name}
            </h4>
          </div>

          {/* Edit button */}
          <div
            onClick={handleEditClick}
            className={`
              p-1.5 rounded-lg transition-all duration-200 cursor-pointer
              ${isEditing
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
            title={isEditing ? 'Close editor' : 'Edit colors'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>

        {/* Color swatches (non-editing mode) */}
        {!isEditing && (
          <div className="flex gap-2">
            {/* Primary color swatch */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full h-6 rounded-md shadow-inner transition-transform duration-300 group-hover:scale-105 border border-white/10"
                style={{ backgroundColor: brand.primary }}
                title={`Primary: ${brand.primary}`}
              />
              <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-wide font-medium">
                Primary
              </span>
            </div>

            {/* Secondary color swatch */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full h-6 rounded-md shadow-inner transition-transform duration-300 group-hover:scale-105 border border-white/10"
                style={{ backgroundColor: brand.secondary }}
                title={`Secondary: ${brand.secondary}`}
              />
              <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-wide font-medium">
                Secondary
              </span>
            </div>

            {/* Accent color swatch */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full h-6 rounded-md shadow-inner transition-transform duration-300 group-hover:scale-105 border border-white/10"
                style={{ backgroundColor: brand.accent }}
                title={`Accent: ${brand.accent}`}
              />
              <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-wide font-medium">
                Accent
              </span>
            </div>
          </div>
        )}
      </button>

      {/* Color picker panel (editing mode) */}
      {isEditing && (
        <div className="mt-2 p-3 bg-gray-800 border border-gray-700 rounded-xl space-y-3 animate-fade-in">
          {/* Primary color picker */}
          <div className="flex items-center gap-3">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide font-medium w-16">
              Primary
            </label>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="color"
                value={brand.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={brand.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 font-mono focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Secondary color picker */}
          <div className="flex items-center gap-3">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide font-medium w-16">
              Secondary
            </label>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="color"
                value={brand.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={brand.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 font-mono focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="#666666"
              />
            </div>
          </div>

          {/* Accent color picker */}
          <div className="flex items-center gap-3">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide font-medium w-16">
              Accent
            </label>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="color"
                value={brand.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={brand.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 font-mono focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="#CCCCCC"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            {/* Reset button - only show if edited */}
            {isEdited && (
              <button
                onClick={handleReset}
                className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                title="Reset to default colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            )}
            
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
              title="Delete this brand"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaintBucket;
