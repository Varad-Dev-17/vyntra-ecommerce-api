import Product from "../models/product.js";
import Category from "../models/category.js";
import SubCategory from "../models/subCategory.js";
import Brand from "../models/brand.js";
import Attribute from "../models/attribute.js";
import AttributeOption from "../models/attributeOption.js";
import ProductReview from "../models/productReview.js";

// GET ALL PRODUCTS (with pagination, search, sort, filter)
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      status,
    } = req.query;

    const query = {};

    // Search by title or description
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Filters
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (status) query.status = status;

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Rating range
    if (minRating !== undefined || maxRating !== undefined) {
      query.ratingAverage = {};
      if (minRating !== undefined) query.ratingAverage.$gte = Number(minRating);
      if (maxRating !== undefined) query.ratingAverage.$lte = Number(maxRating);
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("brand", "name")
        .populate("createdBy", "username email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      data: null,
    });
  }
};

// GET SINGLE PRODUCT BY ID (with reviews)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name")
      .populate("attributes.attribute", "name")
      .populate("createdBy", "username email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const reviews = await ProductReview.find({ product: id })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: { product, reviews },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      data: null,
    });
  }
};

// GET ATTRIBUTES BY CATEGORY (for product creation flow)
export const getAttributesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    const attributes = await Attribute.find({ status: "active" })
      .populate({
        path: "options",
        match: { status: "active" },
        select: "value",
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Attributes fetched successfully",
      data: attributes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attributes",
      data: null,
    });
  }
};

// ADD PRODUCT
export const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      images,
      category,
      subCategory,
      brand,
      attributes,
      price,
      stock,
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      !category ||
      !subCategory ||
      !brand ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, category, subCategory, brand, price, and stock are required",
        data: null,
      });
    }

    // Check duplicate title
    const existingProduct = await Product.findOne({
      title: title.trim(),
    });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this title already exists",
        data: null,
      });
    }

    // Validate category
    const categoryDoc = await Category.findOne({
      _id: category,
      status: "active",
    });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
        data: null,
      });
    }

    // Validate subCategory
    const subCategoryDoc = await SubCategory.findOne({
      _id: subCategory,
      status: "active",
    });
    if (!subCategoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive subCategory",
        data: null,
      });
    }

    // Validate brand
    const brandDoc = await Brand.findOne({ _id: brand, status: "active" });
    if (!brandDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive brand",
        data: null,
      });
    }

    // Validate attributes if provided
    let validatedAttributes = [];
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      for (const attr of attributes) {
        if (!attr.attribute || !attr.values || !Array.isArray(attr.values)) {
          return res.status(400).json({
            success: false,
            message:
              "Each attribute must have an attribute ID and values array",
            data: null,
          });
        }

        const attributeDoc = await Attribute.findOne({
          _id: attr.attribute,
          status: "active",
        });
        if (!attributeDoc) {
          return res.status(400).json({
            success: false,
            message: `Invalid or inactive attribute: ${attr.attribute}`,
            data: null,
          });
        }

        // Validate values exist in AttributeOption
        const validOptions = await AttributeOption.find({
          attribute: attr.attribute,
          value: { $in: attr.values },
          status: "active",
        });

        if (validOptions.length !== attr.values.length) {
          return res.status(400).json({
            success: false,
            message: `Some attribute values are invalid for attribute: ${attributeDoc.name}`,
            data: null,
          });
        }

        validatedAttributes.push({
          attribute: attr.attribute,
          values: attr.values,
        });
      }
    }

    const product = await Product.create({
      title: title.trim(),
      description: description?.trim() || "",
      images: images || [],
      category,
      subCategory,
      brand,
      attributes: validatedAttributes,
      price: Number(price),
      stock: Number(stock),
      ratingAverage: 0,
      ratingCount: 0,
      wishlistCount: 0,
      status: "active",
      createdBy: req.user.userId,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name")
      .populate("createdBy", "username email");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      data: null,
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      images,
      category,
      subCategory,
      brand,
      attributes,
      price,
      stock,
      status,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Check duplicate title if changing
    if (title?.trim() && title.trim() !== product.title) {
      const existingProduct = await Product.findOne({
        title: title.trim(),
        _id: { $ne: id },
      });
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "Product with this title already exists",
          data: null,
        });
      }
      product.title = title.trim();
    }

    // Validate and update category
    if (category) {
      const categoryDoc = await Category.findOne({
        _id: category,
        status: "active",
      });
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive category",
          data: null,
        });
      }
      product.category = category;
    }

    // Validate and update subCategory
    if (subCategory) {
      const subCategoryDoc = await SubCategory.findOne({
        _id: subCategory,
        status: "active",
      });
      if (!subCategoryDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive subCategory",
          data: null,
        });
      }
      product.subCategory = subCategory;
    }

    // Validate and update brand
    if (brand) {
      const brandDoc = await Brand.findOne({ _id: brand, status: "active" });
      if (!brandDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive brand",
          data: null,
        });
      }
      product.brand = brand;
    }

    // Validate and update attributes
    if (attributes && Array.isArray(attributes)) {
      let validatedAttributes = [];
      for (const attr of attributes) {
        if (!attr.attribute || !attr.values || !Array.isArray(attr.values)) {
          return res.status(400).json({
            success: false,
            message:
              "Each attribute must have an attribute ID and values array",
            data: null,
          });
        }

        const attributeDoc = await Attribute.findOne({
          _id: attr.attribute,
          status: "active",
        });
        if (!attributeDoc) {
          return res.status(400).json({
            success: false,
            message: `Invalid or inactive attribute: ${attr.attribute}`,
            data: null,
          });
        }

        const validOptions = await AttributeOption.find({
          attribute: attr.attribute,
          value: { $in: attr.values },
          status: "active",
        });

        if (validOptions.length !== attr.values.length) {
          return res.status(400).json({
            success: false,
            message: `Some attribute values are invalid for attribute: ${attributeDoc.name}`,
            data: null,
          });
        }

        validatedAttributes.push({
          attribute: attr.attribute,
          values: attr.values,
        });
      }
      product.attributes = validatedAttributes;
    }

    // Update other fields
    if (description !== undefined) product.description = description.trim();
    if (images !== undefined) product.images = images;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (status) product.status = status;

    await product.save();

    const populatedProduct = await Product.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name")
      .populate("attributes.attribute", "name")
      .populate("createdBy", "username email");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: populatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      data: null,
    });
  }
};

// DELETE PRODUCT (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    product.status = "inactive";
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      data: null,
    });
  }
};

// GET RELATED PRODUCTS
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      status: "active",
      $or: [
        { category: product.category },
        { subCategory: product.subCategory },
        { brand: product.brand },
      ],
    })
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name")
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      message: "Related products fetched successfully",
      data: relatedProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch related products",
      data: null,
    });
  }
};
