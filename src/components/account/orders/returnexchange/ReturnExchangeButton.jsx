import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReturnExchangeButton = ({ orderId, productId, item, eligibility, onClick }) => {
  const navigate = useNavigate();

  const handleReturnExchange = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      navigate(`/account/orders/${orderId}/return/${productId}`, { state: { orderItem: item } });
    }
  };

  if (!eligibility) return null;

  const { showButton, buttonLabel, helperMessage, hasReturnRequest } = eligibility;

  return (
    <div className="flex flex-col items-end text-right">
      {showButton ? (
        <button
          onClick={hasReturnRequest ? (e) => { e.stopPropagation(); alert('View Request coming soon!'); } : handleReturnExchange}
          className={`px-4 py-1.5 text-sm font-medium border rounded-md transition-colors cursor-pointer z-10 relative ${
            hasReturnRequest 
              ? 'text-white bg-[#4F46E5] hover:bg-[#4338ca] border-transparent' 
              : 'text-[#4F46E5] border-[#e0e7ff] hover:bg-[#eef2ff]'
          }`}
        >
          {buttonLabel}
        </button>
      ) : null}
      
      {helperMessage && (
        <p className={`text-xs mt-1 ${showButton ? 'text-green-600 font-medium' : (eligibility.isExpired && !hasReturnRequest ? 'text-red-500 font-medium' : 'text-gray-500 italic')}`}>
          {helperMessage}
        </p>
      )}
    </div>
  );
};

export default ReturnExchangeButton;
