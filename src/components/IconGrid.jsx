/**
 * IconGrid Component
 * Responsive grid display for uploaded icons
 */

import IconItem from './IconItem';

const IconGrid = ({ icons, selectedBrand, favorites, onPaint, onDownload, onRemove, onColorModeChange, onToggleFavorite }) => {
  // Show empty state if no icons
  if (icons.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      {/* Grid of icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {icons.map((icon, index) => (
          <div
            key={icon.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <IconItem
              icon={icon}
              selectedBrand={selectedBrand}
              isFavorite={favorites?.has(icon.id)}
              onPaint={onPaint}
              onDownload={onDownload}
              onRemove={onRemove}
              onColorModeChange={onColorModeChange}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconGrid;
