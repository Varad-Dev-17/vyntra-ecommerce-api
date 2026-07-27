import AttributeMapping from "../models/attributeMapping.js";
import Attribute from "../models/attribute.js";
import Product from "../models/product.js";

// GET /admin/categories/:id/attributes
// Return only mapped attributes
export const getMappedAttributes = async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { usage } = req.query;

    const mappings = await AttributeMapping.find({ category: categoryId })
      .populate("attribute")
      .lean();

    // Filter out invalid attributes and status
    const attributes = mappings
      .filter((m) => m.attribute && m.attribute.status === "Active")
      // Map to just return the populated attributes and filter by usage if provided
      .filter((m) => !usage || (m.attribute && m.attribute.usage === usage))
      .map((m) => ({
        mappingId: m._id,
        ...m.attribute,
      }));

    res.status(200).json({
      success: true,
      attributes,
    });
  } catch (error) {
    console.error("[Get Mapped Attributes] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mapped attributes.",
    });
  }
};

// GET /admin/categories/:id/available-attributes
// Return only attributes that are NOT yet mapped
export const getAvailableAttributes = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    // 1. Find all currently mapped attribute IDs for this Category
    const mappings = await AttributeMapping.find({ category: categoryId }).lean();
    const mappedAttributeIds = mappings.map((m) => m.attribute);

    // 2. Find all active global attributes excluding the mapped ones
    const availableAttributes = await Attribute.find({
      _id: { $nin: mappedAttributeIds },
      status: "Active",
    }).lean();

    res.status(200).json({
      success: true,
      attributes: availableAttributes,
    });
  } catch (error) {
    console.error("[Get Available Attributes] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available attributes.",
    });
  }
};

// POST /admin/categories/:id/attributes
// Maps one or more attributes to the Category
export const mapAttributes = async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { attributeId, attributeIds } = req.body;

    const idsToMap = attributeIds || (attributeId ? [attributeId] : []);

    if (idsToMap.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No attributes provided to map.",
      });
    }

    // Build the bulk array
    const mappingsToInsert = idsToMap.map((attrId) => ({
      category: categoryId,
      attribute: attrId,
    }));

    // Insert ignoring duplicates if they somehow happen (though UI shouldn't allow it)
    await AttributeMapping.insertMany(mappingsToInsert, { ordered: false }).catch((err) => {
      // Ignore 11000 duplicate key error, throw if it's something else
      if (err.code !== 11000) {
        throw err;
      }
    });

    res.status(201).json({
      success: true,
      message: "Attributes mapped successfully.",
    });
  } catch (error) {
    console.error("[Map Attributes] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to map attributes.",
    });
  }
};

// DELETE /admin/categories/:id/attributes/:attributeId
// Unmaps a specific attribute constraint
export const unmapAttribute = async (req, res) => {
  try {
    const { id: categoryId, attributeId } = req.params;

    // Business Rule: Block unmapping if products are already using this attribute
    const productCount = await Product.countDocuments({
      category: categoryId,
      "attributes.attribute": attributeId,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot unmap attribute: Products are actively using it.",
      });
    }

    const mapping = await AttributeMapping.findOneAndDelete({
      category: categoryId,
      attribute: attributeId,
    });

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attribute unmapped successfully.",
    });
  } catch (error) {
    console.error("[Unmap Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unmap attribute.",
    });
  }
};
