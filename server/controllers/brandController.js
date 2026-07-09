import Brand from "../models/brand.js";

// Get All Brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      brands,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch brands.",
    });
  }
};

// Get Single Brand
export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate(
      "createdBy",
      "username email"
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    res.status(200).json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch brand.",
    });
  }
};

// Create Brand
export const createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required.",
      });
    }

    const existingBrand = await Brand.findOne({
      name: name.trim(),
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists.",
      });
    }

    const brand = await Brand.create({
      name: name.trim(),
      description,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Brand created successfully.",
      brand,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create brand.",
    });
  }
};

// Update Brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, status } = req.body;

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    if (name) {
      const existingBrand = await Brand.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          message: "Brand already exists.",
        });
      }

      brand.name = name.trim();
    }

    if (description !== undefined) {
      brand.description = description;
    }

    if (status) {
      brand.status = status;
    }

    await brand.save();

    res.status(200).json({
      success: true,
      message: "Brand updated successfully.",
      brand,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update brand.",
    });
  }
};

// Delete Brand
// Soft Delete
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    brand.status = "inactive";

    await brand.save();

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete brand.",
    });
  }
};
