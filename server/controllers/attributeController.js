import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";
import AttributeMapping from "../models/attributeMapping.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

// GET All Attributes (with search, pagination, options count)
export const getAttributes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category, usage, sort } = req.query;
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;
    if (category) query.categoryIds = category;
    if (usage) query.usage = usage;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Using aggregation to get the options count
    const attributes = await Attribute.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "attributeoptions", // Mongoose pluralizes model name
          localField: "_id",
          foreignField: "attribute",
          as: "options"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryIds",
          foreignField: "_id",
          as: "categoryIds"
        }
      },
      {
        $addFields: {
          optionsCount: { $size: "$options" },
          id: "$_id"
        }
      },
      {
        $project: {
          options: 0 // exclude the massive array of options, just keep count
        }
      }
    ]);

    const total = await Attribute.countDocuments(query);

    res.status(200).json({
      success: true,
      count: attributes.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
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

    const attribute = await Attribute.findById(id).populate("categoryIds", "name");

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

// GET Attributes By Category
export const getAttributesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const attributes = await Attribute.find({
      categoryIds: categoryId,
      status: "Active",
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: attributes.length,
      attributes,
    });
  } catch (error) {
    console.error("[Get Attributes By Category] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attributes.",
    });
  }
};

// POST Create Attribute
export const createAttribute = async (req, res) => {
  try {
    const { categoryIds, name, fieldType, status, usage } = req.body;

    if (!name || !fieldType) {
      return res.status(400).json({
        success: false,
        message: "Attribute name and fieldType are required.",
      });
    }

    const validFieldTypes = ["select", "color", "text", "number"];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: `fieldType must be one of: ${validFieldTypes.join(", ")}.`,
      });
    }

    if (categoryIds && categoryIds.length > 0) {
      const categoriesExist = await Category.find({ _id: { $in: categoryIds } });
      if (categoriesExist.length !== categoryIds.length) {
        return res.status(404).json({
          success: false,
          message: "One or more categories not found.",
        });
      }
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
      categoryIds: categoryIds || [],
      name: name.trim(),
      fieldType,
      usage: usage || "Product",
      status: status || "Active",
    });

    // Create AttributeMapping documents
    if (categoryIds && categoryIds.length > 0) {
      const mappingsToInsert = categoryIds.map((catId) => ({
        category: catId,
        attribute: attribute._id,
      }));
      await AttributeMapping.insertMany(mappingsToInsert);
    }

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
    const { categoryIds, name, status, usage } = req.body;
    // We explicitly ignore fieldType during update as changing it breaks existing product data.

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    if (categoryIds) {
      const categoriesExist = await Category.find({ _id: { $in: categoryIds } });
      if (categoriesExist.length !== categoryIds.length) {
        return res.status(404).json({
          success: false,
          message: "One or more categories not found.",
        });
      }
      attribute.categoryIds = categoryIds;

      // Sync AttributeMapping documents
      await AttributeMapping.deleteMany({ attribute: id });
      if (categoryIds.length > 0) {
        const mappingsToInsert = categoryIds.map((catId) => ({
          category: catId,
          attribute: id,
        }));
        await AttributeMapping.insertMany(mappingsToInsert);
      }
    }

    if (name) {
      const existingAttribute = await Attribute.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingAttribute) {
        return res.status(409).json({
          success: false,
          message: "An attribute with this name already exists.",
        });
      }

      attribute.name = name.trim();
    }

    if (status) attribute.status = status;
    if (usage) attribute.usage = usage;

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

// DELETE Attribute (Hard Delete with constraints)
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

    // Validation 1: Check if any Products are currently using this Attribute
    const productCount = await Product.countDocuments({
      "attributes.attribute": id,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: Products are currently using this Attribute.",
      });
    }

    // Validation 2: Check if mapped to any Category
    const mappingCount = await AttributeMapping.countDocuments({ attribute: id });
    if (mappingCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: Attribute is mapped to one or more Categories.",
      });
    }

    // Proceed to hard delete the attribute
    await Attribute.findByIdAndDelete(id);

    // Cascade delete options
    await AttributeOption.deleteMany({ attribute: id });

    res.status(200).json({
      success: true,
      message: "Attribute and its options deleted successfully.",
    });
  } catch (error) {
    console.error("[Delete Attribute] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attribute.",
    });
  }
};
