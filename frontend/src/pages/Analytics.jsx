import React, { useEffect, useMemo, useState } from 'react';
import analyticsService from '../services/analyticsService';
import { useToast } from '../lib/ToastContext';
import DateFilterBar from '../components/DateFilterBar';

const padDatePart = (value) => String(value).padStart(2, '0');

const formatInputDate = (date) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
);

const formatType = (type) => {
  if (type === 'dine-in') return 'Dine-in';
  if (type === 'takeaway') return 'Takeaway';
  return type;
};

const isRangeSelectionError = (error) => {
  const message = error?.response?.data?.message || '';

  return message.includes("'from' and 'to' are required")
    || message.includes('Invalid date range')
    || message.includes("'from' cannot be greater than 'to'")
    || message.includes('From date cannot be before 2018-01-01');
};

const PieChart = ({ data, colors, size = 'md' }) => {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  const dim = size === 'sm' ? 'w-28 h-28' : size === 'lg' ? 'w-48 h-48' : 'w-36 h-36';
  const textMain = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  const textSub = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[10px]' : 'text-[9px]';

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center ${dim} text-sm text-gray-400`}>
        No data
      </div>
    );
  }

  let cumulativePercent = 0;
  const slices = data.map((item, index) => {
    const percent = (item.revenue / total) * 100;
    const slice = {
      id: item._id || item.type || index,
      percent,
      dashArray: `${percent} ${100 - percent}`,
      dashOffset: -cumulativePercent,
      color: colors[index] || '#e5e7eb'
    };
    cumulativePercent += percent;
    return slice;
  });

  return (
    <div className={`relative ${dim} shrink-0`}>
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {slices.map((slice) => (
          <circle
            key={slice.id}
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke={slice.color}
            strokeWidth="3"
            strokeDasharray={slice.dashArray}
            strokeDashoffset={slice.dashOffset}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${textMain} font-bold text-gray-900`}>
          {total >= 100000
            ? `₹${(total / 100000).toFixed(2)}L`
            : total >= 1000
              ? `₹${(total / 1000).toFixed(2)}k`
              : `₹${total.toFixed(0)}`}
        </span>
        <span className={`${textSub} text-gray-500 uppercase`}>Total</span>
      </div>
    </div>
  );
};

const Analytics = () => {
  const { showToast } = useToast();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const isSelectingRange = Boolean(fromDate || toDate);
  const activeFilter = isSelectingRange ? 'range' : 'month';

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (activeFilter === 'range' && (!fromDate || !toDate)) {
        return;
      }

      setLoading(true);
      try {
        const params = { filter: activeFilter, _t: Date.now() };

        if (activeFilter === 'range') {
          params.from = fromDate;
          params.to = toDate;
        }

        const res = await analyticsService.getAnalytics(params);
        setData(res.data);
      } catch (error) {
        if (!isRangeSelectionError(error)) {
          showToast(error.response?.data?.message || 'Failed to load analytics', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeFilter, fromDate, toDate, showToast]);

  const dailyData = data?.dailySales || [];

  const hourlyData = useMemo(() => {
    const hourlyMap = new Map((data?.hourlySales || []).map((entry) => [entry.hour, entry.value]));

    return Array.from({ length: 24 }, (_, hour) => {
      return {
        hour,
        value: hourlyMap.get(hour) || 0
      };
    });
  }, [data?.hourlySales]);

  const maxDailyRevenue = useMemo(
    () => Math.max(...dailyData.map((entry) => entry.value), 0),
    [dailyData]
  );

  const maxHourlyRevenue = useMemo(
    () => Math.max(...hourlyData.map((entry) => entry.value), 0),
    [hourlyData]
  );

  const totalRevenue = data?.summary?.totalRevenue || 0;
  const totalOrders = data?.summary?.totalOrders || 0;
  const avgOrderSize = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const periodLabel = data?.periodLabel || 'This Month';
  const periodCaption = activeFilter === 'range' ? 'custom period' : 'this month';

  const productPieColors = [
    '#DC2626',
    '#F97316',
    '#F59E0B',
    '#22C55E',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#E11D48',
    '#84CC16',
    '#9CA3AF'
  ];

  const productPieData = useMemo(() => {
    if (!data?.topProducts?.length) return [];

    const topProductsRevenue = data.topProducts.reduce((sum, item) => sum + item.revenue, 0);
    const remainingRevenue = totalRevenue - topProductsRevenue;
    const result = [...data.topProducts];

    if (remainingRevenue > 0) {
      result.push({ _id: 'OTHER', revenue: remainingRevenue });
    }

    return result;
  }, [data?.topProducts, totalRevenue]);

  const paymentSorted = useMemo(() => {
    if (!data?.paymentDistribution?.length) return [];

    return data.paymentDistribution
      .map((entry) => ({
        _id: entry.type,
        type: entry.type,
        revenue: entry.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data?.paymentDistribution]);

  const orderTypeSorted = useMemo(() => {
    const raw = data?.orderTypeDistribution || [];
    const normalized = {};

    raw.forEach((entry) => {
      const key = formatType(entry.type);
      normalized[key] = (normalized[key] || 0) + entry.revenue;
    });

    return Object.entries(normalized)
      .map(([type, revenue]) => ({ _id: type, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data?.orderTypeDistribution]);

  const formatCurrency = (num) =>
    num >= 100000
      ? `₹${(num / 100000).toFixed(2)}L`
      : num >= 1000
        ? `₹${(num / 1000).toFixed(2)}k`
        : `₹${num.toFixed(0)}`;

  const handleDownloadReport = async () => {
    if (activeFilter === 'range' && (!fromDate || !toDate)) {
      return;
    }

    setIsDownloading(true);

    try {
      const params = { filter: activeFilter };

      if (activeFilter === 'range') {
        params.from = fromDate;
        params.to = toDate;
      }

      const res = await analyticsService.downloadAnalyticsReport(params);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const contentDisposition = res.headers['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fallbackFileName = activeFilter === 'range'
        ? `analytics-report-${fromDate}_to_${toDate}.csv`
        : `analytics-report-${formatInputDate(new Date()).slice(0, 7)}.csv`;
      const fileName = fileNameMatch?.[1] || fallbackFileName;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Analytics report downloaded', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to download analytics report', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <span className="animate-pulse text-gray-400 font-medium">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col gap-6 overflow-y-auto p-4 lg:p-6 pb-10 analytics-scroll bg-gray-100">
      <style>{`.analytics-scroll::-webkit-scrollbar{width:6px}.analytics-scroll::-webkit-scrollbar-track{background:transparent}.analytics-scroll::-webkit-scrollbar-thumb{background:transparent;border-radius:10px}.analytics-scroll:hover::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15)}`}</style>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold italic tracking-tight text-gray-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">{periodLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Downloading...' : 'Download Report'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex-shrink-0">
        <DateFilterBar
          activeFilter={activeFilter}
          fromDate={fromDate}
          toDate={toDate}
          onThisMonthClick={() => {
            setFromDate('');
            setToDate('');
          }}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            sub: periodCaption,
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: 'Total Orders',
            value: totalOrders.toLocaleString('en-IN'),
            sub: periodCaption,
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )
          },
          {
            title: 'Avg Order Size',
            value: formatCurrency(avgOrderSize),
            sub: 'revenue / order',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          }
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-red-50 text-red-500">
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{card.title}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{card.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 flex-shrink-0">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Revenue Trend
          </h2>
          <p className="text-xs text-gray-500">
            {dailyData.length} point{dailyData.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="relative h-52">
          <div className="flex items-end gap-[2px] h-full">
            {dailyData.map((day) => {
              const barPct = maxDailyRevenue > 0
                ? (day.value / maxDailyRevenue) * 100
                : 0;

              return (
                <div
                  key={day.label}
                  className="flex-1 h-full relative"
                  title={`${day.label}: ${formatCurrency(day.value)}`}
                >
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300 ${day.value === 0
                      ? 'bg-gray-100'
                      : day.value >= 20000
                        ? 'bg-red-500'
                        : 'bg-red-300'
                      }`}
                    style={{ height: `${barPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-[2px] mt-1.5">
          {dailyData.map((day) => (
            <div key={day.label} className="flex-1 text-center">
              <span className="text-[9px] text-gray-400 select-none">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 flex-shrink-0">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Hourly Revenue
          </h2>
          <p className="text-xs text-gray-500">
            24 fixed hours
          </p>
        </div>
        <div className="relative h-52">
          <div className="flex items-end gap-1 h-full">
            {hourlyData.map((hour) => {
              const barPct = maxHourlyRevenue > 0
                ? (hour.value / maxHourlyRevenue) * 100
                : 0;

              return (
                <div
                  key={hour.hour}
                  className="flex-1 h-full relative"
                  title={`${hour.hour}:00 - ${formatCurrency(hour.value)}`}
                >
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300 ${hour.value === 0
                      ? 'bg-gray-100'
                      : hour.value >= 20000
                        ? 'bg-red-500'
                        : 'bg-red-300'
                      }`}
                    style={{ height: `${barPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-1 mt-1.5">
          {hourlyData.map((hour) => (
            <div key={hour.hour} className="flex-1 text-center">
              <span className="text-[9px] text-gray-400 select-none">{hour.hour}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-[9px] text-gray-400">12 AM</span>
          <span className="text-[9px] text-gray-400">6 AM</span>
          <span className="text-[9px] text-gray-400">12 PM</span>
          <span className="text-[9px] text-gray-400">6 PM</span>
          <span className="text-[9px] text-gray-400">11 PM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-shrink-0">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-red-50 text-red-500 shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Products by Revenue
            </h2>
          </div>
          <div className="p-6 flex-1 flex items-center">
            <div className="flex items-center gap-10 w-full">
              <PieChart data={productPieData} colors={productPieColors} size="lg" />
              <div className="flex flex-col gap-3.5 min-w-0 flex-1">
                {productPieData.map((product, index) => {
                  const percent = totalRevenue > 0
                    ? ((product.revenue / totalRevenue) * 100).toFixed(1)
                    : '0';

                  return (
                    <div key={product._id} className="flex items-center gap-3 hover:bg-gray-50 rounded-md px-1.5 py-1 -mx-1.5 transition-colors">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: productPieColors[index] }}
                      />
                      <span className="text-base text-gray-900 truncate font-medium flex-1 min-w-0">{product._id}</span>
                      <span className="text-[11px] text-gray-900 shrink-0 tabular-nums text-right w-10">
                        {formatCurrency(product.revenue)}
                      </span>
                      <span className="text-xs font-bold text-gray-900 shrink-0 tabular-nums text-right w-12">
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="px-5 py-3.5 bg-red-50 text-red-500">
              <h2 className="text-sm font-bold uppercase tracking-wide">
                Payments
              </h2>
            </div>
            <div className="p-5 flex-1 flex items-center">
              <div className="flex items-center gap-5 w-full">
                <PieChart data={paymentSorted} colors={['#6B7280', '#9CA3AF', '#D1D5DB']} size="sm" />
                <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                  {paymentSorted.map((payment, index) => {
                    const total = paymentSorted.reduce((sum, item) => sum + item.revenue, 0);
                    const percent = total > 0 ? ((payment.revenue / total) * 100).toFixed(1) : '0';
                    const bgColors = ['bg-gray-600', 'bg-gray-400', 'bg-gray-300'];

                    return (
                      <div key={payment._id} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColors[index]}`} />
                        <span className="text-xs text-gray-900 capitalize truncate flex-1 min-w-0">{payment.type}</span>
                        <span className="text-[11px] text-gray-500 shrink-0 tabular-nums">
                          {formatCurrency(payment.revenue)}
                        </span>
                        <span className="text-[11px] font-bold text-gray-900 shrink-0 tabular-nums text-right w-10">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="px-5 py-3.5 bg-red-50 text-red-500">
              <h2 className="text-sm font-bold uppercase tracking-wide">
                Order Types
              </h2>
            </div>
            <div className="p-5 flex-1 flex items-center">
              <div className="flex items-center gap-5 w-full">
                <PieChart data={orderTypeSorted} colors={['#DC2626', '#ffcd07']} size="sm" />
                <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                  {orderTypeSorted.map((orderType, index) => {
                    const total = orderTypeSorted.reduce((sum, item) => sum + item.revenue, 0);
                    const percent = total > 0 ? ((orderType.revenue / total) * 100).toFixed(1) : '0';
                    const bgColors = ['bg-red-600', 'bg-yellow-400'];

                    return (
                      <div key={orderType._id} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColors[index]}`} />
                        <span className="text-xs text-gray-900 truncate flex-1 min-w-0">{orderType._id}</span>
                        <span className="text-[11px] text-gray-500 shrink-0 tabular-nums text-right w-16">
                          {formatCurrency(orderType.revenue)}
                        </span>
                        <span className="text-[11px] font-bold text-gray-900 shrink-0 tabular-nums text-right w-10">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
