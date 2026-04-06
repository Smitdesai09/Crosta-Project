const Bill = require("../models/bills");

exports.getMonthlyAnalytics = async (req, res) => {
    try {

        const now = new Date();

        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();

        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 1, 0, 0, 0, 0);


        const analytics = await Bill.aggregate([

            {
                $match: {
                    createdAt: { $gte: start, $lt: end }
                }
            },

            {
                $facet: {

                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: "$totalAmount" },
                                totalOrders: { $sum: 1 },
                                totalItems: { $sum: { $sum: "$items.quantity" } }
                            }
                        }
                    ],

                    dailySales: [
                        {
                            $group: {
                                _id: { $dayOfMonth: "$createdAt" },
                                revenue: { $sum: "$totalAmount" },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],

                    hourlySales: [
                        {
                            $project: {
                                hour: { $hour: "$createdAt" },
                                totalAmount: 1
                            }
                        },
                        {
                            $group: {
                                _id: "$hour",
                                revenue: { $sum: "$totalAmount" },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],

                    paymentDistribution: [
                        {
                            $group: {
                                _id: "$paymentType",
                                revenue: { $sum: "$totalAmount" },
                                orders: { $sum: 1 }
                            }
                        }
                    ],

                    orderTypeDistribution: [
                        {
                            $group: {
                                _id: "$orderType",
                                revenue: { $sum: "$totalAmount" },
                                orders: { $sum: 1 }
                            }
                        }
                    ],

                    topProducts: [
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: "$items.name",
                                quantity: { $sum: "$items.quantity" },
                                revenue: { $sum: "$items.subtotal" }
                            }
                        },
                        { $sort: { quantity: -1 } },
                        { $limit: 10 }
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
        res.status(500).json({
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
};