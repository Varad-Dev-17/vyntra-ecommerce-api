import React from 'react';

const ActionSelector = ({ action, setAction }) => {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-3">Action Required</label>
      <div className="flex flex-wrap gap-3">
        <label 
          className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg cursor-pointer transition-colors ${
            action === 'return' 
              ? 'border-[#4F46E5] bg-[#eef2ff] text-[#4F46E5]' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <input 
            type="radio" 
            name="action" 
            value="return" 
            checked={action === 'return'} 
            onChange={() => setAction('return')} 
            className="w-4 h-4 text-[#4F46E5] focus:ring-[#4F46E5] border-gray-300" 
          />
          <span className="text-[14px] font-bold">Return</span>
        </label>
        
        <label 
          className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg cursor-pointer transition-colors ${
            action === 'exchange' 
              ? 'border-[#4F46E5] bg-[#eef2ff] text-[#4F46E5]' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <input 
            type="radio" 
            name="action" 
            value="exchange" 
            checked={action === 'exchange'} 
            onChange={() => setAction('exchange')} 
            className="w-4 h-4 text-[#4F46E5] focus:ring-[#4F46E5] border-gray-300" 
          />
          <span className="text-[14px] font-bold">Exchange</span>
        </label>
      </div>
    </div>
  );
};

export default ActionSelector;
