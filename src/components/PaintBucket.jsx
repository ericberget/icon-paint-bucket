/**
 * PaintBucket Component
 * Visual paint bucket selector for brand colors
 */

const PaintBucket = ({ brand, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full p-4 rounded-xl
        transition-all duration-300 ease-out
        group
        ${isSelected
          ? 'bg-white/20 ring-2 ring-white shadow-lg shadow-white/10 scale-105'
          : 'bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Paint bucket visual */}
      <div className="flex items-center gap-3 mb-3">
        {/* Bucket icon with primary color */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            transition-transform duration-300
            ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
          `}
          style={{ backgroundColor: brand.primary }}
        >
          <svg
            className="w-6 h-6"
            fill={brand.secondary === '#000000' || brand.secondary === '#002B49' ? 'white' : brand.secondary}
            viewBox="0 0 24 24"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
          </svg>
        </div>

        {/* Brand name */}
        <div className="flex-1 text-left">
          <h4 className={`
            font-semibold text-sm
            transition-colors duration-300
            ${isSelected ? 'text-white' : 'text-white/80'}
          `}>
            {brand.name}
          </h4>
        </div>
      </div>

      {/* Color swatches */}
      <div className="flex gap-2">
        {/* Primary color swatch */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="w-full h-8 rounded-lg shadow-inner transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: brand.primary }}
            title={`Primary: ${brand.primary}`}
          />
          <span className="text-[10px] text-white/50 mt-1 uppercase tracking-wide">
            Primary
          </span>
        </div>

        {/* Secondary color swatch */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="w-full h-8 rounded-lg shadow-inner transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: brand.secondary }}
            title={`Secondary: ${brand.secondary}`}
          />
          <span className="text-[10px] text-white/50 mt-1 uppercase tracking-wide">
            Secondary
          </span>
        </div>

        {/* Accent color swatch */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="w-full h-8 rounded-lg shadow-inner transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: brand.accent }}
            title={`Accent: ${brand.accent}`}
          />
          <span className="text-[10px] text-white/50 mt-1 uppercase tracking-wide">
            Accent
          </span>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className={`
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
          ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}
        `}
        style={{
          background: `radial-gradient(circle at center, ${brand.primary}20 0%, transparent 70%)`,
        }}
      />
    </button>
  );
};

export default PaintBucket;
