const Bill = require("../models/bills");

const TIMEZONE = "+05:30";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const getAnalyticsRange = (month, year) => {
    const start = new Date(
        `${year}-${String(month).padStart(2, "0")}-01T00:00:00${TIMEZONE}`
    );

    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;

    const end = new Date(
        `${endYear}-${String(endMonth).padStart(2, "0")}-01T00:00:00${TIMEZONE}`
    );

    return { start, end };
};

const formatCsvValue = (value) => {
    if (value === null || value === undefined) return '""';
    return `"${String(value).replace(/"/g, '""')}"`;
};

const buildCsvRow = (values) => values.map(formatCsvValue).join(",");

const formatReportDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });


/* -------------------------------- */
/* CORE ANALYTICS HELPER            */
/* -------------------------------- */

const generateMonthlyAnalytics = async (month, year) => {

    const { start, end } = getAnalyticsRange(month, year);

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
                            hour: {
                                $hour: {
                                    date: "$createdAt",
                                    timezone: TIMEZONE
                                }
                            },
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

    const result = analytics[0] || {};

    const summary = result.summary?.length
        ? result.summary[0]
        : { totalRevenue: 0, totalOrders: 0, totalItems: 0 };

    return {
        summary,
        dailySales: result.dailySales || [],
        hourlySales: result.hourlySales || [],
        paymentDistribution: (result.paymentDistribution || []).map(p => ({
            type: p._id,
            revenue: p.revenue
        })),
        orderTypeDistribution: (result.orderTypeDistribution || []).map(o => ({
            type: o._id,
            revenue: o.revenue
        })),
        topProducts: result.topProducts || []
    };
};


/* -------------------------------- */
/* GET ANALYTICS API                */
/* -------------------------------- */

exports.getMonthlyAnalytics = async (req, res) => {
    try {

        const now = new Date();

        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();

        const analytics = await generateMonthlyAnalytics(month, year);

        res.json(analytics);

    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
};


/* -------------------------------- */
/* DOWNLOAD ANALYTICS CSV           */
/* -------------------------------- */

exports.downloadAnalyticsReport = async (req, res) => {
    try {

        const now = new Date();

        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();

        /* USE SAME DATA AS GET METHOD */
        const analytics = await generateMonthlyAnalytics(month, year);

        const csvLines = [

            buildCsvRow(["Analytics Report"]),
            buildCsvRow(["Month", MONTH_NAMES[month - 1]]),
            buildCsvRow(["Year", year]),
            buildCsvRow(["Generated At", formatReportDate(new Date())]),
            "",

            buildCsvRow(["Summary"]),
            buildCsvRow(["Metric", "Value"]),
            buildCsvRow(["Total Revenue", analytics.summary.totalRevenue]),
            buildCsvRow(["Total Orders", analytics.summary.totalOrders]),
            buildCsvRow(["Total Items", analytics.summary.totalItems]),
            "",

            buildCsvRow(["Daily Sales"]),
            buildCsvRow(["Day", "Revenue"]),
            ...analytics.dailySales.map(d =>
                buildCsvRow([d._id, d.revenue])
            ),

            "",

            buildCsvRow(["Hourly Sales"]),
            buildCsvRow(["Hour", "Revenue"]),
            ...analytics.hourlySales.map(h =>
                buildCsvRow([h._id, h.revenue])
            ),

            "",

            buildCsvRow(["Payment Distribution"]),
            buildCsvRow(["Payment Type", "Revenue"]),
            ...analytics.paymentDistribution.map(p =>
                buildCsvRow([p.type, p.revenue])
            ),

            "",

            buildCsvRow(["Order Type Distribution"]),
            buildCsvRow(["Order Type", "Revenue"]),
            ...analytics.orderTypeDistribution.map(p =>
                buildCsvRow([p.type, p.revenue])
            ),

            "",

            buildCsvRow(["Top Products"]),
            buildCsvRow(["Product Name", "Revenue"]),
            ...analytics.topProducts.map(p =>
                buildCsvRow([p._id, p.revenue])
            )
        ];

        const fileName =
            `analytics-report-${year}-${String(month).padStart(2, "0")}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition",
            `attachment; filename="${fileName}"`);

        res.status(200).send(`\uFEFF${csvLines.join("\n")}`);

    } catch (error) {

        console.error("Analytics export error:", error);

        res.status(500).json({
            message: "Failed to download analytics report",
            error: error.message
        });
    }
};