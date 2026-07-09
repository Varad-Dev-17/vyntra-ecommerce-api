import Attribute from "../models/attribute.js";

// GET All Attributes
export const getAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attributes.length,
      attributes,
    });
  } catch (error) {
    console.error("[Get Attributes] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attributes.",
    });
  }
};

// GET Single Attribute
export const getAttribute = async (req, res) => {
  try {
    const { id } = req.params;

    const attribute = await Attribute.findById(id).populate(
      "createdBy",
      "username email"
    );

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    res.status(200).json({
      success: true,
      attribute,
    });
  } catch (error) {
    console.error("[Get Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attribute.",
    });
  }
};

// POST Create Attribute
export const createAttribute = async (req, res) => {
  try {
    const { name, fieldType } = req.body;

    if (!name || !fieldType) {
      return res.status(400).json({
        success: false,
        message: "Attribute name and fieldType are required.",
      });
    }

    const validFieldTypes = ["text", "number", "select", "multiselect"];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: `fieldType must be one of: ${validFieldTypes.join(", ")}.`,
      });
    }

    const existingAttribute = await Attribute.findOne({
      name: name.trim(),
    });

    if (existingAttribute) {
      return res.status(409).json({
        success: false,
        message: "Attribute already exists.",
      });
    }

    const attribute = await Attribute.create({
      name: name.trim(),
      fieldType,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Attribute created successfully.",
      attribute,
    });
  } catch (error) {
    console.error("[Create Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create attribute.",
    });
  }
};

// PUT Update Attribute
export const updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fieldType, status } = req.body;

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    if (name) {
      const existingAttribute = await Attribute.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingAttribute) {
        return res.status(409).json({
          success: false,
          message: "Attribute already exists.",
        });
      }

      attribute.name = name.trim();
    }

    if (fieldType) {
      const validFieldTypes = ["text", "number", "select", "multiselect"];
      if (!validFieldTypes.includes(fieldType)) {
        return res.status(400).json({
          success: false,
          message: `fieldType must be one of: ${validFieldTypes.join(", ")}.`,
        });
      }
      attribute.fieldType = fieldType;
    }

    if (status) attribute.status = status;

    await attribute.save();

    res.status(200).json({
      success: true,
      message: "Attribute updated successfully.",
      attribute,
    });
  } catch (error) {
    console.error("[Update Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attribute.",
    });
  }
};

// DELETE Attribute (Soft Delete)
export const deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    attribute.status = "inactive";
    await attribute.save();

    res.status(200).json({
      success: true,
      message: "Attribute deleted successfully.",
    });
  } catch (error) {
    console.error("[Delete Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attribute.",
    });
  }
};
