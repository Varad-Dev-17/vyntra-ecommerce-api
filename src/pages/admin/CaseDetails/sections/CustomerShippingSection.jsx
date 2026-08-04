import React from 'react';
import { User, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import SectionCard from '../components/SectionCard';
import { useNavigate } from 'react-router-dom';
import CopyBadge from '../components/CopyBadge';

const CustomerShippingSection = ({ customer = {}, shippingAddress = {}, originalOrderId = "", originalOrderNumber = "" }) => {
  const navigate = useNavigate();

  const fullName = customer.username || customer.name || "Customer";
  const email = customer.email || null;
  const phone = customer.mobileNo || customer.phone || shippingAddress.mobileNo || shippingAddress.phone || null;

  const fullAddressStr = [
    shippingAddress.address || shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.country,
    shippingAddress.pincode
  ].filter(Boolean).join(", ");

  const isVerified = customer.isVerified || customer.verified;

  return (
    <SectionCard icon={User} title="Customer & Shipping" className="w-full">
      <div className="flex flex-col gap-5 items-stretch">
        {/* Section 1: Customer Basic Contact */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
              <span>{fullName}</span>
              {isVerified && (
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" title="Verified User account" />
              )}
            </h4>
          </div>

          {(email || phone) && (
            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {email && (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Mail size={14} className="text-gray-400 shrink-0 stroke-[2]" />
                  <CopyBadge text={email} label="Email" className="truncate font-medium">
                    {email}
                  </CopyBadge>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-gray-400 shrink-0 stroke-[2]" />
                  <CopyBadge text={phone} label="Phone number" className="font-medium">
                    {phone}
                  </CopyBadge>
                </div>
              )}
            </div>
          )}

          {/* Link to Original Order if on Return / Exchange Case */}
          {originalOrderId && (
            <div className="pt-1">
              <button
                onClick={() => navigate(`/admin/orders/${originalOrderId}`)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/70 text-[#4F46E5] font-bold text-xs border border-indigo-100 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <ExternalLink size={14} />
                <span className="truncate">View Order ({originalOrderNumber || `#${originalOrderId.slice(-6).toUpperCase()}`})</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Shipping Address Box */}
        {shippingAddress && (shippingAddress.address || shippingAddress.street || shippingAddress.city || shippingAddress.pincode) ? (
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#4F46E5]" />
              Shipping Address
            </span>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200/70 leading-relaxed font-medium">
              <CopyBadge text={fullAddressStr} label="Shipping address" showIcon={true} className="flex flex-col items-start text-left w-full hover:bg-transparent">
                {shippingAddress.address && <p>{shippingAddress.address}</p>}
                {shippingAddress.street && <p>{shippingAddress.street}</p>}
                <p className="text-gray-600 font-semibold mt-1">
                  {[
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.country,
                    shippingAddress.pincode ? `- ${shippingAddress.pincode}` : "",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </CopyBadge>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-100 text-gray-400 text-xs font-medium">
            No physical shipping address recorded for this order.
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default CustomerShippingSection;
