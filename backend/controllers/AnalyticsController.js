const Bill = require("../models/bills");

exports.getMonthlyAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();

        // ✅ FIX: Use explicit IST timezone for date boundaries
        // Change +05:30 if your business is in a different timezone
        const TIMEZONE = "+05:30"; // IST
        
        const start = new Date(
            `${year}-${String(month).padStart(2, '0')}-01T00:00:00${TIMEZONE}`
        );
        
        const endMonth = month === 12 ? 1 : month + 1;
        const endYear = month === 12 ? year + 1 : year;
        const end = new Date(
            `${endYear}-${String(endMonth).padStart(2, '0')}-01T00:00:00${TIMEZONE}`
        );

        // ✅ FIX: Also specify timezone in $dayOfMonth and $hour
        const analytics = await Bill.aggregate([
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: "$totalAmount" },
                                totalOrders: { $sum: 1 },
                                totalItems: { 
                                    $sum: { 
                                        $reduce: {
                                            input: "$items",
                                            initialValue: 0,
                                            in: { $add: ["$$value", "$$this.quantity"] }
                                        }
                                    }
                                }
                            }
                        }
                    ],

                    dailySales: [
                        {
                            $group: {
                                _id: { 
                                    $dayOfMonth: { 
                                        date: "$createdAt", 
                                        timezone: TIMEZONE 
                                    } 
                                },
                                revenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],

                    hourlySales: [
                        { 
                            $project: { 
                                hour: { $hour: { date: "$createdAt", timezone: TIMEZONE } }, 
                                totalAmount: 1 
                            } 
                        },
                        {
                            $group: {
                                _id: "$hour",
                                revenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],

                    paymentDistribution: [
                        {
                            $group: {
                                _id: "$paymentType",
                                revenue: { $sum: "$totalAmount" }
                            }
                        }
                    ],

                    orderTypeDistribution: [
                        {
                            $group: {
                                _id: "$orderType",
                                revenue: { $sum: "$totalAmount" }
                            }
                        }
                    ],

                    topProducts: [
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: "$items.name",
                                revenue: { $sum: "$items.subtotal" }
                            }
                        },
                        { $sort: { revenue: -1 } },
                        { $limit: 7 }
                    ]
                }
            }
        ]);

        const result = analytics[0];

        const summary = result.summary.length
            ? result.summary[0]
            : { totalRevenue: 0, totalOrders: 0, totalItems: 0 };

        res.json({
            summary,
            dailySales: result.dailySales,
            hourlySales: result.hourlySales,
            paymentDistribution: result.paymentDistribution,
            orderTypeDistribution: result.orderTypeDistribution,
            topProducts: result.topProducts
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
};