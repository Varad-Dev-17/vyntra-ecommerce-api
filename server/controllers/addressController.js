import Address from "../models/address.js";

// @desc    Get all addresses of logged-in user
// @route   GET /addresses
export const getAddresses = async (req, res) => {
  try {
    const { userId } = req.user;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("[Get Addresses Error]:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Add a new address
// @route   POST /addresses
export const addAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      pincode,
      isDefault,
    } = req.body;

    // Check if the user already has addresses
    const existingAddressesCount = await Address.countDocuments({ userId });
    
    // If it's the first address, force it to be default
    const shouldBeDefault = existingAddressesCount === 0 ? true : isDefault;

    // If new address is default, unset others
    if (shouldBeDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      pincode,
      isDefault: shouldBeDefault,
    });

    await newAddress.save();

    res.status(201).json({ success: true, message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("[Add Address Error]:", error);
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update an address
// @route   PUT /addresses/:id
export const updateAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      pincode,
      isDefault,
    } = req.body;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // If making this address default, unset others
    if (isDefault && !address.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    // If unsetting default, we must ensure there's at least one default if multiple exist.
    // Business rule: Never allow a user to have zero default addresses when addresses exist.
    if (address.isDefault && isDefault === false) {
      const totalAddresses = await Address.countDocuments({ userId });
      if (totalAddresses > 1) {
        // Find another address to make default before saving this one as non-default
        const anotherAddress = await Address.findOne({ _id: { $ne: id }, userId });
        if (anotherAddress) {
          anotherAddress.isDefault = true;
          await anotherAddress.save();
        }
      } else {
        // If it's the only address, it must remain default
        return res.status(400).json({ success: false, message: "You must have at least one default address." });
      }
    }

    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.landmark = landmark !== undefined ? landmark : address.landmark;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    address.pincode = pincode || address.pincode;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    res.status(200).json({ success: true, message: "Address updated successfully", address });
  } catch (error) {
    console.error("[Update Address Error]:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete an address
// @route   DELETE /addresses/:id
export const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // If the deleted address was the default, make the most recently created one default
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("[Delete Address Error]:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Set default address
// @route   PATCH /addresses/:id/default
export const setDefaultAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (address.isDefault) {
      return res.status(200).json({ success: true, message: "Address is already default" });
    }

    // Unset all other defaults
    await Address.updateMany({ userId }, { isDefault: false });

    // Set this one as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({ success: true, message: "Default address updated successfully" });
  } catch (error) {
    console.error("[Set Default Address Error]:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
