import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const MultiSelect = ({
  options = [], // [{ value: '...', label: '...' }]
  values = [], // ['val1', 'val2']
  onChange, // fn(['val1', 'val2'])
  placeholder = 'Select...',
  label,
  disabled = false,
  loading = false,
  error = false,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listboxRef = useRef(null);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter((opt) => 
      opt.label.toLowerCase().includes(lowerQuery)
    );
  }, [options, searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (disabled || loading) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (val) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const handleRemove = (e, val) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== val));
  };

  let triggerClass = `w-full flex flex-wrap items-center gap-2 min-h-[48px] px-3 py-2 bg-white border outline-none transition-all cursor-pointer rounded-xl`;
  
  if (disabled || loading) {
    triggerClass += ' bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed';
  } else if (error) {
    triggerClass += ' border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500';
  } else if (isOpen) {
    triggerClass += ' border-[#4648d4] ring-1 ring-[#4648d4]';
  } else {
    triggerClass += ' border-gray-200 hover:border-gray-300';
  }

  const selectedOptionsMap = useMemo(() => {
    const map = {};
    options.forEach(opt => {
      map[opt.value] = opt;
    });
    return map;
  }, [options]);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[#4648d4] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div 
        className={triggerClass}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div className="flex-1 flex flex-wrap gap-1.5">
          {values.length === 0 && (
            <span className="text-gray-400 text-sm mt-0.5 ml-1">{loading ? 'Loading...' : placeholder}</span>
          )}
          {values.map(val => {
            const opt = selectedOptionsMap[val];
            if (!opt) return null;
            return (
              <div 
                key={val} 
                className="flex items-center gap-1 bg-[#4648d4]/10 text-[#4648d4] px-2 py-1 rounded-md text-sm font-medium"
              >
                <span>{opt.label}</span>
                <button 
                  type="button" 
                  onClick={(e) => handleRemove(e, val)}
                  className="hover:bg-[#4648d4]/20 rounded-full p-0.5 transition-colors focus:outline-none"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 shrink-0 ml-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
          )}
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full h-10 pl-9 pr-4 text-sm bg-gray-50 border-none rounded-lg outline-none focus:ring-1 focus:ring-[#4648d4]/30 focus:bg-white transition-colors"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
              />
            </div>
          </div>

          <div 
            ref={listboxRef}
            className="max-h-60 overflow-y-auto p-1 py-1"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = values.includes(opt.value);
                const isHighlighted = index === highlightedIndex;

                let optionClass = "flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors";
                
                if (isSelected) {
                  optionClass += " bg-indigo-50/50 text-[#4648d4] font-medium";
                } else if (isHighlighted) {
                  optionClass += " bg-gray-50 text-gray-900";
                } else {
                  optionClass += " text-gray-700 hover:bg-gray-50";
                }

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={optionClass}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="truncate pr-4">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0 text-[#4648d4]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
