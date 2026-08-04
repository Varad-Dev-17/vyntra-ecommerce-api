import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Package, Lock, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileSection from '../../components/account/profile/ProfileSection';
import OrdersSection from '../../components/account/orders/OrdersSection';
import ChangePasswordSection from '../../components/account/security/ChangePasswordSection';
import SavedAddressSection from '../../components/account/addresses/SavedAddressSection';

const MyAccount = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { logout } = useAuth();

  const activeTab = tab || 'profile';

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate('/signin');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 flex flex-col md:flex-row overflow-hidden min-h-[700px]">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-r border-gray-100 p-6 shrink-0 flex flex-col">
            <nav className="space-y-2 flex-1">
              <button
                onClick={() => navigate('/account/profile')}
                className={`w-full text-left px-4 py-2.5 rounded-full font-bold text-[14px] transition-colors flex items-center gap-3 ${activeTab === 'profile' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <User size={18} className={activeTab === 'profile' ? 'text-[#4F46E5]' : 'text-gray-400'} />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => navigate('/account/orders')}
                className={`w-full text-left px-4 py-2.5 rounded-full font-medium text-[14px] transition-colors flex items-center gap-3 ${activeTab === 'orders' ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Package size={18} className={activeTab === 'orders' ? 'text-[#4F46E5]' : 'text-gray-400'} />
                <span>Orders</span>
              </button>
              <button
                onClick={() => navigate('/account/addresses')}
                className={`w-full text-left px-4 py-2.5 rounded-full font-medium text-[14px] transition-colors flex items-center gap-3 ${activeTab === 'addresses' ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <MapPin size={18} className={activeTab === 'addresses' ? 'text-[#4F46E5]' : 'text-gray-400'} />
                <span>Delivery Addresses</span>
              </button>
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => navigate('/account/security')}
                className={`w-full text-left px-4 py-2.5 rounded-full font-medium text-[14px] transition-colors flex items-center gap-3 ${activeTab === 'security' ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Lock size={18} className={activeTab === 'security' ? 'text-[#4F46E5]' : 'text-gray-400'} />
                <span>Change Password</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-full font-medium text-[14px] transition-colors flex items-center gap-3 text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 md:p-10">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'orders' && <OrdersSection />}
            {activeTab === 'addresses' && <SavedAddressSection />}
            {activeTab === 'security' && <ChangePasswordSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
