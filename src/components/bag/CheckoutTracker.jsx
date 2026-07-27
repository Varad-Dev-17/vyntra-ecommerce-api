import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutTracker = ({ currentStep }) => {
  const steps = [
    { id: 'bag', label: 'BAG', path: '/bag' },
    { id: 'address', label: 'ADDRESS', path: '/checkout/address' },
    { id: 'payment', label: 'PAYMENT', path: '/checkout/payment' },
  ];

  const getStepIndex = (id) => steps.findIndex((step) => step.id === id);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full flex justify-center items-center py-6">
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const isClickable = isPast || isActive;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center">
                {isClickable ? (
                  <Link
                    to={step.path}
                    className={`text-[13px] sm:text-[15px] font-bold tracking-widest pb-1 border-b-2 ${
                      isActive
                        ? 'text-[#03a685] border-[#03a685]'
                        : 'text-[#535766] border-transparent hover:text-[#03a685]'
                    }`}
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span
                    className={`text-[13px] sm:text-[15px] font-bold tracking-widest pb-1 border-b-2 border-transparent text-[#7e818c]`}
                  >
                    {step.label}
                  </span>
                )}
              </div>

              {/* Dotted Divider */}
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-16 md:w-24 border-t-2 border-dashed ${
                    index < currentIndex ? 'border-[#03a685]' : 'border-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutTracker;
