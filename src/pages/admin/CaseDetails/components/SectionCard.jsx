import React from 'react';

const SectionCard = ({ icon: Icon, title, action, children, className = "" }) => {
  return (
    <div className={`w-full flex flex-col py-6 border-b border-gray-100 last:border-b-0 first:pt-0 last:pb-0 ${className}`}>
      {/* Seamless Minimalist Section Title */}
      {(Icon || title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="text-[#4F46E5] flex items-center justify-center shrink-0">
                <Icon size={18} className="stroke-[2.5]" />
              </span>
            )}
            {title && (
              <h3 className="font-bold text-slate-700 text-base tracking-tight">
                {title}
              </h3>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      {/* Seamless Open Body */}
      <div className="grow flex flex-col">{children}</div>
    </div>
  );
};

export default SectionCard;
