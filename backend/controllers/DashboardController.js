const Bill = require("../models/Bills");
const Product = require("../models/Products");

exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date();
    start.setHours(11, 0, 0, 0); // shift start 11 AM

    const end = new Date();
    end.setHours(25, 0, 0, 0); // shift end 1 AM next day (25 % 24 = 1 AM)

    // 1️⃣ Aggregate today orders and revenue
    const todayAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
    ]);
    const todayRevenue = todayAgg.length ? todayAgg[0].totalRevenue : 0;
    const todayOrders = todayAgg.length ? todayAgg[0].totalOrders : 0;

    // 2️⃣ Active products
    const activeProducts = await Product.countDocuments({ isAvailable: true });

    // 3️⃣ Last 5 bills
    const recentBills = await Bill.find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount paymentType createdAt operatorName");

    // 4️⃣ Top 5 selling items
    const topItemsAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);
    const topItems = topItemsAgg.map(i => ({ name: i._id, quantity: i.quantity }));

    // 5️⃣ Hourly sales (11 AM - 1 AM)
    const hourlySales = [];
    for (let h = 11; h < 25; h++) hourlySales.push({ hour: h % 24, total: 0 });

    const salesByHour = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $project: { totalAmount: 1, hour: { $hour: "$createdAt" } } },
      { $group: { _id: "$hour", total: { $sum: "$totalAmount" } } }
    ]);
    salesByHour.forEach(s => {
      const idx = hourlySales.findIndex(h => h.hour === s._id);
      if (idx !== -1) hourlySales[idx].total = s.total;
    });

    // 6️⃣ Payment type breakdown
    const paymentAgg = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$paymentType", total: { $sum: 1 } } }
    ]);
    const totalPayments = paymentAgg.reduce((sum, p) => sum + p.total, 0);
    const paymentBreakdown = paymentAgg.map(p => ({
      type: p._id,
      count: p.total,
      percent: totalPayments ? Math.round((p.total / totalPayments) * 100) : 0
    }));

    res.json({
      todayOrders,
      todayRevenue,
      activeProducts,
      recentBills,
      topItems,
      hourlySales,
      paymentBreakdown
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message
    });
  }
};