import { Search } from 'lucide-react';

const SearchToolbar = ({ 
  searchQuery, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  extraFilters = null,
  actionButton = null,
  leftSlot = null
}) => {
  return (
    <div className="flex flex-row items-center gap-4 p-4 border-b border-gray-100 bg-white">
      {/* Left Navigation / Tabs - takes available space and pushes right side elements */}
      {leftSlot && (
        <div className="shrink-0 flex-1 mr-2 min-w-max">
          {leftSlot}
        </div>
      )}
      
      {/* Right side controls container */}
      <div className="flex flex-row items-center justify-end gap-3 shrink-0 flex-nowrap">
        {/* Search Input */}
        <div className="relative w-[200px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors text-sm"
          />
        </div>

        {/* Extra Filters Slot */}
        {extraFilters && (
          <div className="flex flex-row items-center gap-3 shrink-0">
            {extraFilters}
          </div>
        )}

        {/* Action Button */}
        {actionButton && (
          <div className="shrink-0">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchToolbar;
