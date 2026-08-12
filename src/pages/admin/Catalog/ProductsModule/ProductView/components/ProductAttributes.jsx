import { Tag, Cpu, Monitor, Grid as GridIcon } from 'lucide-react';

const ProductAttributes = ({ attributes }) => {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-[16px] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#f4effc] flex items-center justify-center flex-shrink-0">
            <Tag size={20} className="text-[#8b5cf6]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[16px] font-bold text-[#334155] mb-0.5">
              Attributes
            </h3>
            <p className="text-[12px] text-[#64748b]">
              Key specifications of this product
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4effc] rounded-lg">
          <GridIcon size={14} className="text-[#8b5cf6]" />
          <span className="text-[12px] font-medium text-[#8b5cf6]">{attributes.length} Attributes</span>
        </div>
        <div className="absolute bottom-0 left-6 h-[2px] w-12 bg-[#8b5cf6]"></div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-100 gap-px">
        {attributes.map((attr, index) => {
          const formattedValues = attr.values?.map(val => {
            if (!val) return '';
            let clean = val;
            const attrName = attr.attribute?.name?.toLowerCase() || '';
            if (attrName === 'material' || attrName === 'fabric') {
              clean = clean.replace(/-/g, '% ').replace(/_/g, ' ');
            } else {
              clean = clean.replace(/[-_]/g, ' ');
            }
            return clean.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                        .replace(/\b\w/g, c => c.toUpperCase());
          }).join(", ");

          // Determine icon based on attribute name
          const attrLower = (attr.attribute?.name || '').toLowerCase();
          let IconComponent = GridIcon;
          if (attrLower.includes('processor') || attrLower.includes('cpu')) IconComponent = Cpu;
          if (attrLower.includes('display') || attrLower.includes('screen')) IconComponent = Monitor;

          return (
            <div key={index} className="p-5 bg-white flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f4effc] flex items-center justify-center flex-shrink-0">
                <IconComponent size={18} className="text-[#8b5cf6]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-[#64748b]">{attr.attribute?.name || 'Attribute'}</span>
                <span className="text-[13px] font-bold text-[#334155]">
                  {formattedValues || 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductAttributes;
