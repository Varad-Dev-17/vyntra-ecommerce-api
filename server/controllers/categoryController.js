import Category from "../models/category.js";

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("attributes")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
};

// Get Single Category
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate("attributes")
      .populate("createdBy", "username email");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category.",
    });
  }
};

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, attributes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists.",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      attributes,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create category.",
    });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, attributes, status } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    if (name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category already exists.",
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;

    if (attributes !== undefined) category.attributes = attributes;

    if (status) category.status = status;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update category.",
    });
  }
};

// Delete Category
// Soft Delete
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    category.status = "inactive";

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category.",
    });
  }
};
