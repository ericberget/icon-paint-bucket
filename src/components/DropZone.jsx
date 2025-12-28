/**
 * DropZone Component
 * Handles drag-and-drop SVG file uploads with visual feedback
 */

import { useState, useCallback, useRef } from 'react';

const DropZone = ({ onFilesAdded, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

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
      onFilesAdded(files);
    }
  }, [disabled, onFilesAdded]);

  // Handle click to browse
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle file input change
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesAdded(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onFilesAdded]);

  return (
    <div
      className={`
        relative
        border-2 border-dashed rounded-2xl
        transition-all duration-300 ease-in-out
        ${isDragOver
          ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
          : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
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
      <div className="flex flex-col items-center justify-center py-16 px-8">
        {/* Upload icon */}
        <div className={`
          mb-6 p-6 rounded-full
          transition-all duration-300
          ${isDragOver ? 'bg-purple-500/30 scale-110' : 'bg-white/10'}
        `}>
          <svg
            className={`w-12 h-12 transition-colors duration-300 ${isDragOver ? 'text-purple-300' : 'text-white/70'}`}
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
          text-xl font-semibold mb-2
          transition-colors duration-300
          ${isDragOver ? 'text-purple-200' : 'text-white'}
        `}>
          {isDragOver ? 'Drop your SVGs here!' : 'Drop SVG files here'}
        </h3>

        <p className="text-white/60 text-sm mb-4">
          or click to browse your files
        </p>

        {/* Supported formats badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-white/80 text-xs font-medium">
            SVG files supported
          </span>
        </div>
      </div>

      {/* Animated border gradient when dragging */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default DropZone;
