const Bill = require("../models/bills");

const TIMEZONE = "+05:30";
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const getAnalyticsRange = (month, year) => {
    const start = new Date(
        `${year}-${String(month).padStart(2, '0')}-01T00:00:00${TIMEZONE}`
    );

    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const end = new Date(
        `${endYear}-${String(endMonth).padStart(2, '0')}-01T00:00:00${TIMEZONE}`
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

exports.getMonthlyAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();

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

exports.downloadAnalyticsReport = async (req, res) => {
    try {
        const now = new Date();
        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();
        const { start, end } = getAnalyticsRange(month, year);

        const bills = await Bill.find(
            { createdAt: { $gte: start, $lt: end } },
            {
                tableNumber: 1,
                orderType: 1,
                items: 1,
                subtotal: 1,
                discount: 1,
                gst: 1,
                totalAmount: 1,
                paymentType: 1,
                customerPhone: 1,
                operatorName: 1,
                createdAt: 1
            }
        )
            .sort({ createdAt: -1 })
            .lean();

        const summary = bills.reduce((acc, bill) => {
            acc.totalRevenue += bill.totalAmount || 0;
            acc.totalOrders += 1;
            acc.totalItems += (bill.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
            return acc;
        }, { totalRevenue: 0, totalOrders: 0, totalItems: 0 });

        const productSummaryMap = new Map();

        for (const bill of bills) {
            for (const item of bill.items || []) {
                const key = `${item.name}__${item.variant || ""}`;
                const existing = productSummaryMap.get(key) || {
                    name: item.name,
                    variant: item.variant || "",
                    quantity: 0,
                    revenue: 0
                };

                existing.quantity += item.quantity || 0;
                existing.revenue += item.subtotal || 0;
                productSummaryMap.set(key, existing);
            }
        }

        const productSummary = Array.from(productSummaryMap.values())
            .sort((a, b) => b.revenue - a.revenue);

        const csvLines = [
            buildCsvRow(["Analytics Report"]),
            buildCsvRow(["Month", MONTH_NAMES[month - 1] || month]),
            buildCsvRow(["Year", year]),
            buildCsvRow(["Generated At", formatReportDate(new Date())]),
            "",
            buildCsvRow(["Summary"]),
            buildCsvRow(["Metric", "Value"]),
            buildCsvRow(["Total Revenue", summary.totalRevenue.toFixed(2)]),
            buildCsvRow(["Total Orders", summary.totalOrders]),
            buildCsvRow(["Total Items", summary.totalItems]),
            "",
            buildCsvRow(["Bills"]),
            buildCsvRow([
                "Bill ID",
                "Date",
                "Table Number",
                "Order Type",
                "Payment Type",
                "Customer Phone",
                "Operator Name",
                "Subtotal",
                "Discount",
                "GST",
                "Total Amount",
                "Items Count"
            ]),
            ...bills.map((bill) => buildCsvRow([
                bill._id,
                formatReportDate(bill.createdAt),
                bill.tableNumber,
                bill.orderType,
                bill.paymentType,
                bill.customerPhone || "",
                bill.operatorName,
                Number(bill.subtotal || 0).toFixed(2),
                Number(bill.discount || 0).toFixed(2),
                Number(bill.gst || 0).toFixed(2),
                Number(bill.totalAmount || 0).toFixed(2),
                (bill.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
            ])),
            "",
            buildCsvRow(["Product Summary"]),
            buildCsvRow(["Product Name", "Variant", "Quantity Sold", "Revenue"]),
            ...productSummary.map((item) => buildCsvRow([
                item.name,
                item.variant,
                item.quantity,
                Number(item.revenue || 0).toFixed(2)
            ])),
            "",
            buildCsvRow(["Product Details"]),
            buildCsvRow([
                "Bill ID",
                "Bill Date",
                "Product Name",
                "Variant",
                "Quantity",
                "Unit Price",
                "Item Subtotal"
            ]),
            ...bills.flatMap((bill) =>
                (bill.items || []).map((item) => buildCsvRow([
                    bill._id,
                    formatReportDate(bill.createdAt),
                    item.name,
                    item.variant || "",
                    item.quantity || 0,
                    Number(item.price || 0).toFixed(2),
                    Number(item.subtotal || 0).toFixed(2)
                ]))
            )
        ];

        const fileName = `analytics-report-${year}-${String(month).padStart(2, "0")}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.status(200).send(`\uFEFF${csvLines.join("\n")}`);
    } catch (error) {
        console.error("Analytics export error:", error);
        res.status(500).json({ message: "Failed to download analytics report", error: error.message });
    }
};
