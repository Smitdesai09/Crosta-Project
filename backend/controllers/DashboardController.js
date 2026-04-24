const Bill = require("../models/Bills");
const Product = require("../models/Products");

exports.getSummary = async (req, res) => {
  try {

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // 1. Today orders and revenue
    const summaryAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$totalAmount" },
          todayOrders: { $sum: 1 }
        }
      }
    ]);

    const todayRevenue = summaryAgg.length ? summaryAgg[0].todayRevenue : 0;
    const todayOrders = summaryAgg.length ? summaryAgg[0].todayOrders : 0;

    // 2. Active products
    const activeProducts = await Product.countDocuments({ isAvailable: true });

    // 3. Recent 5 bills
    const recentBills = await Bill.find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount paymentType createdAt operatorName orderType")
      .lean();

    // 4. Top products today (revenue based)
    const topProductsAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 7 }
    ]);

    const topProducts = topProductsAgg.map(p => ({
      name: p._id,
      revenue: p.revenue
    }));

    // 5. Payment type distribution (revenue based)
    const paymentDistribution = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$paymentType",
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const paymentTypes = paymentDistribution.map(p => ({
      type: p._id,
      revenue: p.revenue
    }));

    // 6. Order type distribution (revenue based)
    const orderTypeAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$orderType",
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const orderTypeDistribution = orderTypeAgg.map(o => ({
      type: o._id,
      revenue: o.revenue
    }));

    res.json({
      summary: {
        todayRevenue,
        todayOrders,
        activeProducts
      },
      recentBills,
      topProducts,
      paymentDistribution: paymentTypes,
      orderTypeDistribution
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};