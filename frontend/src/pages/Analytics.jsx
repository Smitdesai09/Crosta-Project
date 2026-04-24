/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import analyticsService from '../services/analyticsService';
import billService from '../services/billService';
import { useToast } from '../lib/ToastContext';

const formatType = (type) => {
  if (type === 'dine-in') return 'Dine-in';
  if (type === 'takeaway') return 'Takeaway';
  return type;
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
      id: item._id,
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

const FilterSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none cursor-pointer"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239E9E9E'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.5rem center',
      backgroundSize: '1.25rem 1.25rem',
      paddingRight: '2.5rem'
    }}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const Analytics = () => {
  const { showToast } = useToast();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthOptions = monthNames.map((m, i) => ({
    value: String(i + 1),
    label: m
  }));

  const currentYear = now.getFullYear();
  const yearOptions = useMemo(() => {
    const sourceYears = availableYears.length ? availableYears : [currentYear];

    return sourceYears.map((item) => ({
      value: String(item),
      label: String(item)
    }));
  }, [availableYears, currentYear]);

  const fetchAnalytics = async () => {
    if (!month || !year) return;
    setLoading(true);
    try {
      const res = await analyticsService.getAnalytics({ month, year, _t: Date.now() });
      setData(res.data);
    } catch (error) {
      showToast('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [month, year]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const res = await billService.getAvailableYears();
        const fetchedYears = [...(res.data?.data || [])].sort((a, b) => Number(b) - Number(a));

        setAvailableYears(fetchedYears);

        if (fetchedYears.length) {
          setYear((prev) =>
            fetchedYears.some((item) => Number(item) === Number(prev))
              ? Number(prev)
              : Number(fetchedYears[0])
          );
        }
      } catch (error) {
        showToast('Failed to load years', error);
      }
    };

    fetchAvailableYears();
  }, [showToast]);

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  const dailyData = useMemo(() => {
    if (!data?.dailySales)
      return Array.from({ length: daysInMonth }, (_, i) => ({ _id: i + 1, revenue: 0 }));
    return Array.from({ length: daysInMonth }, (_, i) => {
      const found = data.dailySales.find((d) => d._id === i + 1);
      return found || { _id: i + 1, revenue: 0 };
    });
  }, [data, daysInMonth]);

  const hourlyData = useMemo(() => {
    if (!data?.hourlySales)
      return Array.from({ length: 24 }, (_, i) => ({ _id: i, revenue: 0 }));
    return Array.from({ length: 24 }, (_, i) => {
      const found = data.hourlySales.find((h) => h._id === i);
      return found || { _id: i, revenue: 0 };
    });
  }, [data]);

  const maxDailyRevenue = useMemo(
    () => Math.max(...dailyData.map((d) => d.revenue), 0),
    [dailyData]
  );

  const maxHourlyRevenue = useMemo(
    () => Math.max(...hourlyData.map((h) => h.revenue), 0),
    [hourlyData]
  );

  const totalRevenue = data?.summary?.totalRevenue || 0;
  const totalOrders = data?.summary?.totalOrders || 0;
  const avgOrderSize = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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

  const HIGH_COLOR = '#DC2626'
  const LOW_COLOR = '#FCA5A5'

  const productPieData = useMemo(() => {
    if (!data?.topProducts?.length) return [];
    const topProductsRevenue = data.topProducts.reduce((sum, p) => sum + p.revenue, 0);
    const remainingRevenue = totalRevenue - topProductsRevenue;
    const result = [...data.topProducts];
    if (remainingRevenue > 0) {
      result.push({ _id: 'OTHER', revenue: remainingRevenue });
    }
    return result;
  }, [data?.topProducts, totalRevenue]);

  const paymentSorted = useMemo(() => {
    if (!data?.paymentDistribution?.length) return [];
    return [...data.paymentDistribution].sort((a, b) => b.revenue - a.revenue);
  }, [data?.paymentDistribution]);

  const orderTypeSorted = useMemo(() => {
    const raw = data?.orderTypeDistribution || [];
    const normalized = {};
    raw.forEach(o => {
      const key = formatType(o.type);
      normalized[key] = (normalized[key] || 0) + o.revenue;
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

  const compactVal = (num) => {
    if (num === 0) return '';
    if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}k`;
    return num < 10 ? num.toFixed(1) : num.toFixed(0);
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);

    try {
      const res = await analyticsService.downloadAnalyticsReport({ month, year });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const contentDisposition = res.headers['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || `analytics-report-${year}-${String(month).padStart(2, '0')}.csv`;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Analytics report downloaded', 'success');
    } catch (error) {
      showToast('Failed to download analytics report', error);
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

      {/* HEADER */}
      <div className="flex items-end justify-between flex-shrink-0">
        <h1 className="text-3xl font-extrabold italic tracking-tight text-gray-900">
          Analytics
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </button>
          <div className="w-36">
            <FilterSelect
              value={String(month)}
              onChange={(val) => setMonth(Number(val))}
              options={monthOptions}
            />
          </div>
          <div className="w-28">
            <FilterSelect
              value={String(year)}
              onChange={(val) => setYear(Number(val))}
              options={yearOptions}
            />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            sub: 'this month',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: 'Total Orders',
            value: totalOrders.toLocaleString('en-IN'),
            sub: 'this month',
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
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5">
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

      {/* DAILY REVENUE CHART */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5">
          Daily Revenue
        </h2>
        <div className="relative h-52">
          <div className="flex items-end gap-[2px] h-full">
            {dailyData.map((day) => {
              const label = compactVal(day.revenue);
              const barPct = maxDailyRevenue > 0
                ? Math.max((day.revenue / maxDailyRevenue) * 100, 0.5)
                : 0.5;
              return (
                <div key={day._id} className="flex-1 h-full relative">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300 ${day.revenue === 0
                      ? 'bg-gray-100'
                      : day.revenue >= 20000
                        ? 'bg-red-500'
                        : 'bg-red-300'
                      }`}
                    style={{ height: `${barPct}%` }}
                  />
                  {label && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-[8px] font-semibold text-gray-500 whitespace-nowrap pointer-events-none"
                      style={{ bottom: `calc(${barPct}% + 3px)` }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-[2px] mt-1.5">
          {dailyData.map((day) => (
            <div key={day._id} className="flex-1 text-center">
              <span className="text-[9px] text-gray-400 select-none">{day._id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HOURLY REVENUE CHART */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5">
          Hourly Revenue
        </h2>
        <div className="relative h-52">
          <div className="flex items-end gap-1 h-full">
            {hourlyData.map((hour) => {
              const label = compactVal(hour.revenue);
              const barPct = maxHourlyRevenue > 0
                ? Math.max((hour.revenue / maxHourlyRevenue) * 100, 0.5)
                : 0.5;
              return (
                <div key={hour._id} className="flex-1 h-full relative">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300 ${hour.revenue === 0
                        ? 'bg-gray-100'
                        : hour.revenue >= 20000
                          ? 'bg-red-500'
                          : 'bg-red-300'
                      }`}
                    style={{ height: `${barPct}%` }}
                  />
                  {label && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-[8px] font-semibold text-gray-500 whitespace-nowrap pointer-events-none"
                      style={{ bottom: `calc(${barPct}% + 3px)` }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-1 mt-1.5">
          {hourlyData.map((hour) => (
            <div key={hour._id} className="flex-1 text-center">
              <span className="text-[9px] text-gray-400 select-none">{hour._id}</span>
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

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-shrink-0">

        {/* Products Pie — LEFT */}
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
                {productPieData.map((prod, i) => {
                  const percent =
                    totalRevenue > 0 ? ((prod.revenue / totalRevenue) * 100).toFixed(1) : '0';
                  return (
                    <div key={prod._id} className="flex items-center gap-3 hover:bg-gray-50 rounded-md px-1.5 py-1 -mx-1.5 transition-colors">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: productPieColors[i] }}
                      />
                      <span className="text-base text-gray-900 truncate font-medium flex-1 min-w-0">{prod._id}</span>
                      <span className="text-[11px] text-gray-900 shrink-0 tabular-nums text-right w-10">
                        {formatCurrency(prod.revenue)}
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

        {/* Right Container */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Payment Distribution */}
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
                  {paymentSorted.map((p, i) => {
                    const total = paymentSorted.reduce((s, item) => s + item.revenue, 0);
                    const percent = total > 0 ? ((p.revenue / total) * 100).toFixed(1) : '0';
                    const bgColors = ['bg-gray-600', 'bg-gray-400', 'bg-gray-300'];
                    return (
                      <div key={p._id} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColors[i]}`} />
                        <span className="text-xs text-gray-900 capitalize truncate flex-1 min-w-0">{p.type}</span>
                        <span className="text-[11px] text-gray-500 shrink-0 tabular-nums">
                          {formatCurrency(p.revenue)}
                        </span><span className="text-[11px] font-bold text-gray-900 shrink-0 tabular-nums text-right w-10">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order Type Distribution */}
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
                  {orderTypeSorted.map((o, i) => {
                    const total = orderTypeSorted.reduce((s, item) => s + item.revenue, 0);
                    const percent = total > 0 ? ((o.revenue / total) * 100).toFixed(1) : '0';
                    const bgColors = ['bg-red-600', 'bg-yellow-400'];
                    return (
                      <div key={o._id} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColors[i]}`} />
                        <span className="text-xs text-gray-900 truncate flex-1 min-w-0">{o._id}</span>
                        <span className="text-[11px] text-gray-500 shrink-0 tabular-nums text-right w-16">
                          {formatCurrency(o.revenue)}
                        </span><span className="text-[11px] font-bold text-gray-900 shrink-0 tabular-nums text-right w-10">
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