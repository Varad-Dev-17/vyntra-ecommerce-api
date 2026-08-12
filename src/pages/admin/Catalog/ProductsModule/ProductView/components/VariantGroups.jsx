import { Grid, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../../../../../../components/admin/ui/StatusBadge';

const VariantGroups = ({ variants }) => {
  if (!variants || variants.length === 0) return null;

  // Group variants by the 'Color' attribute or the first attribute
  let primaryAttributeId = null;
  let primaryAttributeName = null;

  const firstVariantAttrs = variants[0]?.attributes || [];
  const colorAttr = firstVariantAttrs.find(a => a.attribute?.name?.toLowerCase() === 'color');
  
  if (colorAttr) {
    primaryAttributeId = colorAttr.attribute?._id || colorAttr.attribute;
    primaryAttributeName = colorAttr.attribute?.name || 'Color';
  } else if (firstVariantAttrs.length > 0) {
    primaryAttributeId = firstVariantAttrs[0].attribute?._id || firstVariantAttrs[0].attribute;
    primaryAttributeName = firstVariantAttrs[0].attribute?.name;
  }

  // Find secondary attribute (if any)
  const secondaryAttr = firstVariantAttrs.find(a => (a.attribute?._id || a.attribute) !== primaryAttributeId);
  const secondaryAttrId = secondaryAttr?.attribute?._id || secondaryAttr?.attribute;
  const secondaryAttrName = secondaryAttr?.attribute?.name || 'Size';

  const groupedVariants = [];
  
  if (primaryAttributeId) {
    const groupMap = new Map();
    variants.forEach(variant => {
      const primaryAttrObj = variant.attributes?.find(a => (a.attribute?._id || a.attribute) === primaryAttributeId);
      if (primaryAttrObj) {
        const optionId = primaryAttrObj.option?._id || primaryAttrObj.option;
        const optionName = primaryAttrObj.option?.displayName || primaryAttrObj.option?.storedValue || 'Unknown';
        
        if (!groupMap.has(optionId)) {
          groupMap.set(optionId, {
            optionId,
            optionName,
            variants: [],
            mainImage: variant.mainImage?.url,
            imageCount: (variant.mainImage ? 1 : 0) + (variant.galleryImages?.length || 0)
          });
        }
        groupMap.get(optionId).variants.push(variant);
      }
    });
    
    groupMap.forEach(group => groupedVariants.push(group));
  } else {
    // If no attributes, just put all in one group
    groupedVariants.push({
      optionId: 'default',
      optionName: 'Default Group',
      variants: variants,
      mainImage: variants[0]?.mainImage?.url,
      imageCount: (variants[0]?.mainImage ? 1 : 0) + (variants[0]?.galleryImages?.length || 0)
    });
  }

  return (
    <div className="border border-gray-300 p-6 bg-white flex flex-col gap-6">
      <div className="border-b border-gray-200 pb-4 -mt-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
            <Grid size={16} className="text-green-500" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-green-600 tracking-wide uppercase text-[13px] mb-0.5">
              Variant Groups
            </h3>
            <div className="h-[2px] w-12 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groupedVariants.map((group) => {
          // Calculate stats for this group
          const availableSecondaryOptions = [];
          let minPrice = Infinity;
          let maxPrice = -Infinity;
          let totalStock = 0;
          let isActive = false;

          group.variants.forEach(v => {
            if (secondaryAttrId) {
              const secAttrObj = v.attributes?.find(a => (a.attribute?._id || a.attribute) === secondaryAttrId);
              if (secAttrObj && secAttrObj.option?.displayName) {
                if (!availableSecondaryOptions.includes(secAttrObj.option.displayName)) {
                  availableSecondaryOptions.push(secAttrObj.option.displayName);
                }
              }
            }
            if (v.price < minPrice) minPrice = v.price;
            if (v.price > maxPrice) maxPrice = v.price;
            totalStock += (v.stock || 0);
            if (v.status === 'Active') isActive = true;
          });

          // Sort options simple heuristic
          const order = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
          availableSecondaryOptions.sort((a, b) => (order[a] || 99) - (order[b] || 99));

          return (
            <div key={group.optionId} className="border border-gray-200 bg-white rounded-[12px] overflow-hidden flex flex-col">
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {group.mainImage ? (
                    <img src={group.mainImage} alt={group.optionName} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={16} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-0.5">{group.optionName}</h4>
                  <p className="text-[11px] text-gray-500">{group.imageCount} Images</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 mx-4"></div>

              <div className="p-4 flex flex-col gap-3 flex-1 bg-white">
                {availableSecondaryOptions.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-500">{secondaryAttrName} Options</span>
                    <span className="text-[13px] font-semibold text-gray-900 text-right truncate pl-2" title={availableSecondaryOptions.join(' • ')}>
                      {availableSecondaryOptions.join(' • ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">Price Range</span>
                  <span className="text-[13px] font-semibold text-gray-900 text-right">
                    {minPrice === maxPrice && minPrice !== Infinity
                      ? `₹${minPrice}` 
                      : minPrice !== Infinity ? `₹${minPrice} - ₹${maxPrice}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">Stock</span>
                  <span className="text-[13px] font-semibold text-gray-900 text-right">{totalStock}</span>
                </div>
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50 border-dashed">
                  <span className="text-[12px] text-gray-500">Status</span>
                  <StatusBadge status={isActive ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariantGroups;
