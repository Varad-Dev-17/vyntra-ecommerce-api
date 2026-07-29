import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import AddressModal from './AddressModal';
import ConfirmationModal from '../../common/ConfirmationModal';

const SavedAddressSection = () => {
  const { getAuthHeaders } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('/addresses', { headers: getAuthHeaders() });
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveAddress = async (formData) => {
    setIsProcessing(true);
    try {
      if (editingAddress) {
        const response = await axios.put(`/addresses/${editingAddress._id}`, formData, {
          headers: getAuthHeaders(),
        });
        if (response.data.success) {
          toast.success('Address updated successfully');
        }
      } else {
        const response = await axios.post('/addresses', formData, {
          headers: getAuthHeaders(),
        });
        if (response.data.success) {
          toast.success('Address added successfully');
        }
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteClick = (address) => {
    setAddressToDelete(address);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/addresses/${addressToDelete._id}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        toast.success('Address removed successfully');
        setIsDeleteModalOpen(false);
        setAddressToDelete(null);
        fetchAddresses();
      }
    } catch (error) {
      toast.error('Failed to remove address');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await axios.patch(`/addresses/${id}/default`, {}, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
        <button 
          onClick={() => {
            setEditingAddress(null);
            setIsAddressModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#4F46E5] text-[#4F46E5] text-sm font-bold tracking-wide hover:bg-[#EEF2FF] transition-colors uppercase"
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>
      
      {addresses.length === 0 ? (
        <div className="border border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
          <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} className="text-[#4F46E5]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No addresses saved yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Add your home or work address for faster checkout on your next order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          
          <div className="grid grid-cols-1 gap-4">
            {addresses.map((address) => (
              <div key={address._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-shadow relative group">
                
                {/* Main Content Area */}
                <div className="p-6">
                  {/* Header Row: Name & Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[15px] font-bold text-gray-900 tracking-wide">
                        {address.fullName}
                      </h4>
                      <div className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider">
                        {address.label}
                      </div>
                    </div>
                    {address.isDefault && (
                      <div className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded">
                        Default
                      </div>
                    )}
                  </div>

                  {/* Address Details */}
                  <div className="text-[14px] text-gray-600 space-y-1 mt-3">
                    <p>
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      {address.landmark ? `, ${address.landmark}` : ''}
                    </p>
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    <p>{address.country}</p>
                    <p className="pt-2 font-medium">Mobile: <span className="text-gray-900">{address.phone}</span></p>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="border-t border-gray-100 flex items-center divide-x divide-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => handleEditClick(address)}
                    className="flex-1 py-3.5 text-[13px] font-bold text-[#4F46E5] hover:bg-gray-50 transition-colors uppercase tracking-wide"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(address)}
                    className="flex-1 py-3.5 text-[13px] font-bold text-[#4F46E5] hover:bg-gray-50 transition-colors uppercase tracking-wide"
                  >
                    Remove
                  </button>
                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address._id)}
                      className="flex-1 py-3.5 text-[13px] font-bold text-[#4F46E5] hover:bg-gray-50 transition-colors uppercase tracking-wide"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        address={editingAddress}
        isProcessing={isProcessing}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Remove"
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default SavedAddressSection;
