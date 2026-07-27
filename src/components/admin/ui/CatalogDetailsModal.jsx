import React from 'react';
import { X } from 'lucide-react';

const CatalogDetailsModal = ({ 
  isOpen, 
  onClose, 
  title, 
  entityType, 
  entityName, 
  listTitle, 
  listData,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-[#4648d4]">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {entityType}: <span className="font-medium text-gray-900">{entityName}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children ? (
            children
          ) : (
            !listData || listData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                No {listTitle.toLowerCase()} found.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-lg">
                  <div className="col-span-2 text-center">#</div>
                  <div className="col-span-10">{listTitle}</div>
                </div>
                {listData.map((item, index) => (
                  <div key={item._id || index} className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="col-span-2 font-medium text-gray-500 text-sm text-center">
                      {index + 1}
                    </div>
                    <div className="col-span-10 font-medium text-gray-900 text-sm">
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogDetailsModal;
