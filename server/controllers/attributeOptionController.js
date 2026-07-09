import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";

// GET All Attribute Options
export const getAttributeOptions = async (req, res) => {
  try {
    const options = await AttributeOption.find()
      .populate("attribute", "name fieldType")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: options.length,
      options,
    });
  } catch (error) {
    console.error("[Get Attribute Options] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attribute options.",
    });
  }
};

// GET Options By Attribute
export const getOptionsByAttribute = async (req, res) => {
  try {
    const { attributeId } = req.params;

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    const options = await AttributeOption.find({ attribute: attributeId })
      .populate("attribute", "name fieldType")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: options.length,
      attribute,
      options,
    });
  } catch (error) {
    console.error("[Get Options By Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch options by attribute.",
    });
  }
};

// POST Create Attribute Option
export const createAttributeOption = async (req, res) => {
  try {
    const { attribute, value } = req.body;

    if (!attribute || !value) {
      return res.status(400).json({
        success: false,
        message: "Attribute ID and value are required.",
      });
    }

    const existingAttribute = await Attribute.findById(attribute);
    if (!existingAttribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    const existingOption = await AttributeOption.findOne({
      attribute,
      value: value.trim(),
    });

    if (existingOption) {
      return res.status(409).json({
        success: false,
        message: "Option already exists for this attribute.",
      });
    }

    const option = await AttributeOption.create({
      attribute,
      value: value.trim(),
      createdBy: req.user.userId,
    });

    const populatedOption = await AttributeOption.findById(option._id)
      .populate("attribute", "name fieldType")
      .populate("createdBy", "username email");

    res.status(201).json({
      success: true,
      message: "Attribute option created successfully.",
      option: populatedOption,
    });
  } catch (error) {
    console.error("[Create Attribute Option] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create attribute option.",
    });
  }
};

// PUT Update Attribute Option
export const updateAttributeOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, status } = req.body;

    const option = await AttributeOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Attribute option not found.",
      });
    }

    if (value) {
      const existingOption = await AttributeOption.findOne({
        attribute: option.attribute,
        value: value.trim(),
        _id: { $ne: id },
      });

      if (existingOption) {
        return res.status(409).json({
          success: false,
          message: "Option already exists for this attribute.",
        });
      }

      option.value = value.trim();
    }

    if (status) option.status = status;

    await option.save();

    const populatedOption = await AttributeOption.findById(option._id)
      .populate("attribute", "name fieldType")
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "Attribute option updated successfully.",
      option: populatedOption,
    });
  } catch (error) {
    console.error("[Update Attribute Option] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attribute option.",
    });
  }
};

// DELETE Attribute Option (Soft Delete)
export const deleteAttributeOption = async (req, res) => {
  try {
    const { id } = req.params;

    const option = await AttributeOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Attribute option not found.",
      });
    }

    option.status = "inactive";
    await option.save();

    res.status(200).json({
      success: true,
      message: "Attribute option deleted successfully.",
    });
  } catch (error) {
    console.error("[Delete Attribute Option] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attribute option.",
    });
  }
};
