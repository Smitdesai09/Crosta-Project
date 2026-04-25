// backend/utils/dateFilter.js
const TIMEZONE = "+05:30";
const MIN_RANGE_DATE = new Date(`2018-01-01T00:00:00${TIMEZONE}`);

const buildDateFilter = ({ filter, from, to }) => {
  const now = new Date();

  if (filter === "range") {
    if (!from || !to) {
      const error = new Error("'from' and 'to' are required");
      error.status = 400;
      throw error;
    }

    const startDate = new Date(`${from}T00:00:00${TIMEZONE}`);
    const endDate = new Date(`${to}T23:59:59.999${TIMEZONE}`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      const error = new Error("Invalid date range");
      error.status = 400;
      throw error;
    }

    if (startDate > endDate) {
      const error = new Error("'from' cannot be greater than 'to'");
      error.status = 400;
      throw error;
    }

    if (startDate < MIN_RANGE_DATE) {
      const error = new Error("From date cannot be before 2018-01-01");
      error.status = 400;
      throw error;
    }

    return {
      filter: "range",
      startDate,
      endDate,
      label: `${from} to ${to}`,
      fileLabel: `${from}_to_${to}`
    };
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return {
    filter: "month",
    startDate: new Date(`${year}-${month}-01T00:00:00${TIMEZONE}`),
    endDate: now,
    label: "This Month",
    fileLabel: `${year}-${month}`
  };
};

module.exports = { buildDateFilter, TIMEZONE };
