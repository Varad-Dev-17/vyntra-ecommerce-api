import { Info, Tag, Building2, Layers, Activity } from 'lucide-react';
import StatusBadge from '../../../../../../components/admin/ui/StatusBadge';

const ProductInformation = ({ product }) => {
  return (
    <div className="border border-gray-200 rounded-[16px] bg-white flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
          <Info size={20} className="text-[#3b82f6]" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[16px] font-bold text-[#334155] mb-0.5">
            Product Information
          </h3>
          <p className="text-[12px] text-[#64748b]">
            Essential details about the product
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        
        {/* Brand */}
        <div className="p-5 border-b border-gray-100 md:border-r flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
            <Tag size={18} className="text-[#3b82f6]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#64748b]">Brand</span>
            <span className="text-[13px] font-bold text-[#334155]">{product.brand?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Department */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-[#3b82f6]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#64748b]">Department</span>
            <span className="text-[13px] font-bold text-[#334155]">{product.department?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Category */}
        <div className="p-5 md:border-r border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
            <Layers size={18} className="text-[#3b82f6]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#64748b]">Category</span>
            <span className="text-[13px] font-bold text-[#334155]">{product.category?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Status */}
        <div className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center flex-shrink-0">
            <Activity size={18} className="text-[#10b981]" />
          </div>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[12px] text-[#64748b]">Status</span>
            <StatusBadge status={product.status?.toLowerCase() || 'inactive'} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductInformation;
