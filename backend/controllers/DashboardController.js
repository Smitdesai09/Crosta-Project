const Bill = require("../models/Bills");
const Product = require("../models/Products");

exports.getDashboard = async (req, res) => {
  try {

    const start = new Date();
    start.setHours(11, 0, 0, 0); // 11 AM
    const end = new Date();
    end.setHours(25, 0, 0, 0); // 1 AM next day

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


    // 2️. Active products
    const activeProducts = await Product.countDocuments({ isAvailable: true });

    // 3️. Recent 5 bills
    const recentBills = await Bill.find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount paymentType createdAt operatorName")
      .lean();

    // 4️. Top products today
    const topProductsAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = topProductsAgg.map(p => ({
      name: p._id,
      quantity: p.quantity
    }));

  

    // 5️. Payment type distribution
    const paymentDistribution = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$paymentType",
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentTypes = paymentDistribution.map(p => ({
      type: p._id,
      count: p.count
    }));



    // 6️. Order type distribution
    const orderTypeAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      {
        $group: {
          _id: "$order.orderType",
          count: { $sum: 1 }
        }
      }
    ]);

    const orderTypeDistribution = orderTypeAgg.map(o => ({
      type: o._id,
      count: o.count
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