const Bill = require("../models/Bills");
const { buildDateFilter, TIMEZONE } = require("../utils/dateFilter");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DISPLAY_TIMEZONE = "Asia/Kolkata";
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});

const formatCsvValue = (value) => {
    if (value === null || value === undefined) return '""';
    return `"${String(value).replace(/"/g, '""')}"`;
};

const buildCsvRow = (values) => values.map(formatCsvValue).join(",");

const formatReportDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        timeZone: DISPLAY_TIMEZONE,
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

const formatDateLabel = (date) => {
    const parts = DATE_FORMATTER.formatToParts(new Date(date));
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
};

const formatShortDateLabel = (date) => {
    const parts = DATE_FORMATTER.formatToParts(new Date(date));
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${month}/${day}`;
};

const getRangeDays = (startDate, endDate) =>
    Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1;

const getTrendType = (startDate, endDate) => {
    const rangeDays = getRangeDays(startDate, endDate);

    if (rangeDays <= 31) return "day";
    if (rangeDays <= 183) return "week";
    if (rangeDays <= 366) return "month";
    if (rangeDays <= 1826) return "quarter";
    return "year";
};

const buildDailySales = (entries = [], startDate, endDate) => {
    const trendType = getTrendType(startDate, endDate);
    const revenueByDate = new Map(entries.map((entry) => [entry._id, entry.revenue]));
    const buckets = [];
    const bucketMap = new Map();
    const current = new Date(startDate);

    if (trendType === "day") {
        while (current <= endDate) {
            const dateLabel = formatDateLabel(current);

            buckets.push({
                label: formatShortDateLabel(current),
                value: revenueByDate.get(dateLabel) || 0
            });

            current.setUTCDate(current.getUTCDate() + 1);
        }

        return buckets;
    }

    if (trendType === "week") {
        let weekNumber = 1;
        let bucketValue = 0;
        let bucketDayCount = 0;

        while (current <= endDate) {
            const dateLabel = formatDateLabel(current);
            bucketValue += revenueByDate.get(dateLabel) || 0;
            bucketDayCount += 1;

            if (bucketDayCount === 7) {
                buckets.push({ label: `Week ${weekNumber}`, value: bucketValue });
                weekNumber += 1;
                bucketValue = 0;
                bucketDayCount = 0;
            }

            current.setUTCDate(current.getUTCDate() + 1);
        }

        if (bucketDayCount > 0) {
            buckets.push({ label: `Week ${weekNumber}`, value: bucketValue });
        }

        return buckets;
    }

    while (current <= endDate) {
        const dateLabel = formatDateLabel(current);
        const [year, month] = dateLabel.split("-");
        let bucketKey = year;
        let bucketLabel = year;

        if (trendType === "month") {
            bucketKey = `${year}-${month}`;
            bucketLabel = `${MONTH_NAMES[Number(month) - 1]} ${year}`;
        }

        if (trendType === "quarter") {
            const quarter = Math.ceil(Number(month) / 3);
            bucketKey = `${year}-Q${quarter}`;
            bucketLabel = `Q${quarter} ${year}`;
        }

        if (!bucketMap.has(bucketKey)) {
            const bucket = { label: bucketLabel, value: 0 };
            bucketMap.set(bucketKey, bucket);
            buckets.push(bucket);
        }

        bucketMap.get(bucketKey).value += revenueByDate.get(dateLabel) || 0;
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return buckets;
};

const buildHourlySales = (entries = []) => {
    const revenueByHour = new Map(entries.map((entry) => [entry._id, entry.revenue]));

    return Array.from({ length: 24 }, (_, hour) => ({
        hour,
        value: revenueByHour.get(hour) || 0
    }));
};

const normalizeAnalyticsResult = (result = {}, startDate, endDate) => {
    const summary = result.summary?.length
        ? result.summary[0]
        : { totalRevenue: 0, totalOrders: 0, totalItems: 0 };

    return {
        summary,
        dailySales: buildDailySales(result.dailySales || [], startDate, endDate),
        hourlySales: buildHourlySales(result.hourlySales || []),
        paymentDistribution: (result.paymentDistribution || []).map((entry) => ({
            type: entry._id,
            revenue: entry.revenue
        })),
        orderTypeDistribution: (result.orderTypeDistribution || []).map((entry) => ({
            type: entry._id,
            revenue: entry.revenue
        })),
        topProducts: result.topProducts || []
    };
};

const generateAnalytics = async (startDate, endDate) => {
    const analytics = await Bill.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
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
                                $dateToString: {
                                    format: "%Y-%m-%d",
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

    return normalizeAnalyticsResult(analytics[0], startDate, endDate);
};

exports.getMonthlyAnalytics = async (req, res) => {
    try {

        const { startDate, endDate, filter, label } = buildDateFilter(req.query);
        const analytics = await generateAnalytics(startDate, endDate);

        return res.status(200).json({
            ...analytics,
            filter,
            periodLabel: label
        });

    } catch (error) {

        console.error("Analytics error:", error);

        return res.status(error.status || 500).json({
            message: error.message || "Failed to fetch analytics",
            error: error.status ? undefined : error.message
        });
    }
};

exports.downloadAnalyticsReport = async (req, res) => {
    try {

        const { startDate, endDate, filter, label, fileLabel } = buildDateFilter(req.query);
        const analytics = await generateAnalytics(startDate, endDate);

        const csvLines = [
            buildCsvRow(["Analytics Report"]),
            buildCsvRow(["Filter", filter === "range" ? "Custom Range" : "This Month"]),
            buildCsvRow(["Period", label]),
            buildCsvRow(["Generated At", formatReportDate(new Date())]),
            "",

            buildCsvRow(["Summary"]),
            buildCsvRow(["Metric", "Value"]),
            buildCsvRow(["Total Revenue", analytics.summary.totalRevenue]),
            buildCsvRow(["Total Orders", analytics.summary.totalOrders]),
            buildCsvRow(["Total Items", analytics.summary.totalItems]),
            "",

            buildCsvRow(["Revenue Trend"]),
            buildCsvRow(["Label", "Value"]),
            ...analytics.dailySales.map((entry) =>
                buildCsvRow([entry.label, entry.value])
            ),
            "",

            buildCsvRow(["Hourly Sales"]),
            buildCsvRow(["Hour", "Value"]),
            ...analytics.hourlySales.map((entry) =>
                buildCsvRow([entry.hour, entry.value])
            ),
            "",

            buildCsvRow(["Payment Distribution"]),
            buildCsvRow(["Payment Type", "Revenue"]),
            ...analytics.paymentDistribution.map((entry) =>
                buildCsvRow([entry.type, entry.revenue])
            ),
            "",

            buildCsvRow(["Order Type Distribution"]),
            buildCsvRow(["Order Type", "Revenue"]),
            ...analytics.orderTypeDistribution.map((entry) =>
                buildCsvRow([entry.type, entry.revenue])
            ),
            "",

            buildCsvRow(["Top Products"]),
            buildCsvRow(["Product Name", "Revenue"]),
            ...analytics.topProducts.map((entry) =>
                buildCsvRow([entry._id, entry.revenue])
            )
        ];

        const fileName = `analytics-report-${fileLabel}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        return res.status(200).send(`\uFEFF${csvLines.join("\n")}`);

    } catch (error) {

        console.error("Analytics export error:", error);

        return res.status(error.status || 500).json({
            message: error.message || "Failed to download analytics report",
            error: error.status ? undefined : error.message
        });
    }
};
