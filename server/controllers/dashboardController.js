import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import Category from "../models/category.js";
import Brand from "../models/brand.js";

// GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalBrands,
      pendingOrders,
      processingOrders,
      packedOrders,
      shippedOrders,
      onTheWayOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenueAgg,
      monthlyRevenueAgg,
      lastMonthRevenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "packed" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "on_the_way" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          )
        : 0;

    const recentOrders = await Order.find()
      .populate("user", "username email")
      .populate("items.product", "title images")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.sellingPrice"] },
          },
          firstVariantId: { $first: "$items.variant" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "variants",
          localField: "firstVariantId",
          foreignField: "_id",
          as: "variantInfo",
        },
      },
      { $unwind: { path: "$variantInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: "$product.title",
          images: {
            $cond: {
              if: { $and: ["$variantInfo", "$variantInfo.mainImage"] },
              then: ["$variantInfo.mainImage"],
              else: [],
            },
          },
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          customers: { $addToSet: "$user" }
        },
      },
      {
        $project: {
          revenue: 1,
          orders: 1,
          customers: { $size: "$customers" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const salesChart = monthlySales.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
      customers: item.customers,
    }));

    const salesByCategoryRaw = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.sellingPrice"] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    
    const totalCatRevenue = salesByCategoryRaw.reduce((sum, item) => sum + item.totalRevenue, 0);
    const salesByCategory = salesByCategoryRaw.map(item => ({
      category: item._id,
      revenue: Math.round(item.totalRevenue),
      percentage: totalCatRevenue > 0 ? Math.round((item.totalRevenue / totalCatRevenue) * 100) : 0
    }));

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        counts: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalCategories,
          totalBrands,
        },
        orders: {
          pending: pendingOrders,
          processing: processingOrders,
          packed: (packedOrders || 0) + (processingOrders || 0),
          shipped: shippedOrders,
          on_the_way: onTheWayOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          monthly: Math.round(monthlyRevenue * 100) / 100,
          lastMonth: Math.round(lastMonthRevenue * 100) / 100,
          growth: revenueGrowth,
        },
        recentOrders,
        topProducts,
        salesChart,
        salesByCategory,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      data: null,
    });
  }
};

// GET SALES REPORT
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: { $ne: "cancelled" } };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("items.product", "title")
      .sort({ createdAt: -1 })
      .lean();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Sales report fetched successfully",
      data: {
        orders,
        summary: {
          totalOrders: orders.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales report",
      data: null,
    });
  }
};
