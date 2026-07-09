import Category from "../models/category.js";
import SubCategory from "../models/subCategory.js";

// GET ALL SUB CATEGORIES
export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate("category", "name")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      subCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub categories.",
    });
  }
};

// GET SINGLE SUB CATEGORY
export const getSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate("category", "name")
      .populate("createdBy", "username email");

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found.",
      });
    }

    res.status(200).json({
      success: true,
      subCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub category.",
    });
  }
};

// GET SUB CATEGORIES BY CATEGORY
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subCategories = await SubCategory.find({
      category: categoryId,
      status: "active",
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      subCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub categories.",
    });
  }
};

// CREATE SUB CATEGORY
export const createSubCategory = async (req, res) => {
  try {
    const { category, name, description } = req.body;

    if (!category || !name) {
      return res.status(400).json({
        success: false,
        message: "Category and name are required.",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const existing = await SubCategory.findOne({
      category,
      name: name.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Sub category already exists.",
      });
    }

    const subCategory = await SubCategory.create({
      category,
      name: name.trim(),
      description,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Sub category created successfully.",
      subCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create sub category.",
    });
  }
};

// UPDATE SUB CATEGORY
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, description, status } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found.",
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
      subCategory.category = category;
    }

    if (name) {
      const existing = await SubCategory.findOne({
        category: subCategory.category,
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Sub category already exists.",
        });
      }
      subCategory.name = name.trim();
    }

    if (description !== undefined) subCategory.description = description;
    if (status) subCategory.status = status;

    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Sub category updated successfully.",
      subCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update sub category.",
    });
  }
};

// DELETE SUB CATEGORY (soft delete)
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found.",
      });
    }

    subCategory.status = "inactive";
    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Sub category deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete sub category.",
    });
  }
};
