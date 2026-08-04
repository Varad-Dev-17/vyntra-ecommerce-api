import React from "react";
import { useNavigate } from "react-router-dom";
import { Undo2, Clock, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="w-full flex flex-col items-stretch text-left">
      {showButton ? (
        hasReturnRequest ? (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/account/orders/${orderId}`, { state: { scrollToTracking: true } });
            }}
            className="w-full py-1.5 px-3 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between gap-2 text-[13px] group"
          >
            <span className="text-gray-600 font-normal truncate">
              Status: <span className="font-semibold text-[#4F46E5] capitalize">{eligibility.activeRequest?.status || helperMessage?.replace("Status: ", "") || "received"}</span>
            </span>
            <span className="text-[#4F46E5] font-medium text-[12px] group-hover:underline flex items-center gap-0.5 shrink-0">
              Track <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReturnExchange(e);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-4 text-sm font-medium text-[#4F46E5] border border-[#e0e7ff] hover:bg-[#eef2ff] rounded-md transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
              <span>{buttonLabel || "Return / Exchange"}</span>
            </button>
            {helperMessage && (
              <p className="text-[12px] text-green-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>{helperMessage}</span>
              </p>
            )}
          </div>
        )
      ) : helperMessage ? (
        <div className="w-full py-1.5 px-3 rounded-md bg-gray-50 border border-gray-100 text-center">
          <p className="text-[12px] text-gray-500 italic">
            {helperMessage}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ReturnExchangeButton;

