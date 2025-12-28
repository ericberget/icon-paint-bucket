/**
 * DropZone Component
 * Handles drag-and-drop SVG file uploads with visual feedback
 * Includes batch tagging on upload
 */

import { useState, useCallback, useRef } from 'react';

// Style tag options (shared with LibraryView)
const STYLE_TAGS = [
  { id: 'thick-line', label: 'Thick Line' },
  { id: 'thin-line', label: 'Thin Line' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'square', label: 'Square' },
  { id: 'outline', label: 'Outline' },
  { id: 'filled', label: 'Filled' },
  { id: 'duotone', label: 'Duotone' },
];

const DropZone = ({ onFilesAdded, disabled = false, brands = [] }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCustomBrandMode, setIsCustomBrandMode] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const fileInputRef = useRef(null);
  
  // Check if any advanced options are active
  const hasAdvancedOptions = isCustomBrandMode || selectedTags.length > 0;

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTags((prev) => 
      prev.includes(tagId) 
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const uploadOptions = {
        tags: selectedTags,
        isCustomBrand: isCustomBrandMode,
        customBrandId: isCustomBrandMode ? selectedBrandId : null,
      };
      onFilesAdded(files, uploadOptions);
    }
  }, [disabled, onFilesAdded, selectedTags, isCustomBrandMode, selectedBrandId]);

  // Handle click to browse
  const handleClick = useCallback((e) => {
    // Don't trigger file dialog if clicking on tag controls
    if (e.target.closest('.tag-controls')) return;
    
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle file input change
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const uploadOptions = {
        tags: selectedTags,
        isCustomBrand: isCustomBrandMode,
        customBrandId: isCustomBrandMode ? selectedBrandId : null,
      };
      onFilesAdded(files, uploadOptions);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onFilesAdded, selectedTags, isCustomBrandMode, selectedBrandId]);

  return (
    <div
      className={`
        relative
        border-2 border-dashed rounded-2xl
        transition-all duration-300 ease-in-out
        ${isDragOver
          ? 'border-yellow-400 bg-yellow-500/10 scale-[1.02]'
          : 'border-neutral-600 bg-neutral-900/30 hover:border-neutral-500 hover:bg-neutral-900/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Drop zone content */}
      <div className="flex flex-col items-center justify-center py-12 px-8">
        {/* Upload icon */}
        <div className={`
          mb-4 p-4 rounded-full
          transition-all duration-300
          ${isDragOver ? 'bg-yellow-500/20 scale-110' : 'bg-neutral-800'}
        `}>
          <svg
            className={`w-10 h-10 transition-colors duration-300 ${isDragOver ? 'text-yellow-400' : 'text-neutral-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Instructions */}
        <h3 className={`
          text-lg font-semibold mb-1
          transition-colors duration-300
          ${isDragOver ? 'text-yellow-400' : 'text-white'}
        `}>
          {isDragOver ? 'Drop your SVGs here!' : 'Drop SVG files here'}
        </h3>

        <p className="text-neutral-500 text-sm mb-4">
          or click to browse your files
        </p>

        {/* Advanced Upload Settings */}
        <div className="tag-controls flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Advanced Settings Toggle Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              hasAdvancedOptions
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hasAdvancedOptions 
              ? `Advanced Settings (${isCustomBrandMode ? 'Locked' : ''}${isCustomBrandMode && selectedTags.length > 0 ? ' + ' : ''}${selectedTags.length > 0 ? `${selectedTags.length} tags` : ''})`
              : 'Advanced Upload Settings'
            }
            <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Advanced Settings Panel */}
          {showAdvanced && (
            <div className="w-full max-w-sm p-3 bg-neutral-800/90 border border-neutral-700 rounded-lg space-y-4">
              {/* Custom Brand Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Custom Brand Icons
                  </label>
                  <button
                    onClick={() => setIsCustomBrandMode(!isCustomBrandMode)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      isCustomBrandMode ? 'bg-purple-500' : 'bg-neutral-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isCustomBrandMode ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                
                {isCustomBrandMode && (
                  <>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select brand...</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-purple-400/70">
                      Icons will be locked and cannot be recolored.
                    </p>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-700" />

              {/* Style Tags Section */}
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Style Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-yellow-500 text-neutral-900'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300"
                  >
                    Clear tags
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-700" />

              {/* Summary & Done button */}
              <div className="space-y-2">
                {hasAdvancedOptions && (
                  <div className="text-[10px] text-neutral-400 bg-neutral-900/50 rounded p-2">
                    <span className="text-neutral-500">Next upload will include:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {isCustomBrandMode && (
                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[9px]">
                          🔒 Locked
                        </span>
                      )}
                      {selectedTags.map((tagId) => {
                        const tag = STYLE_TAGS.find((t) => t.id === tagId);
                        return tag ? (
                          <span key={tagId} className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px]">
                            {tag.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="w-full py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animated border gradient when dragging */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default DropZone;
