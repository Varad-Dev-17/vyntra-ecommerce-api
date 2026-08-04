import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CopyBadge = ({ text, label = "Item", showIcon = true, children, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    toast.success(`${label} copied to clipboard!`, { 
      duration: 2000, 
      style: { fontSize: '12px', fontWeight: '600' },
      position: 'bottom-right' 
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy} 
      title={`Click to copy ${label.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 cursor-pointer rounded transition-all group hover:text-[#4F46E5] ${className}`}
    >
      <span>{children || text}</span>
      {showIcon && (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0">
          {copied ? (
            <Check size={13} className="text-emerald-600 stroke-[3]" />
          ) : (
            <Copy size={13} className="text-gray-400 group-hover:text-[#4F46E5] stroke-[2.25]" />
          )}
        </span>
      )}
    </div>
  );
};

export default CopyBadge;
