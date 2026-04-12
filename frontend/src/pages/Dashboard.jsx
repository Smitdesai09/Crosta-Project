/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { useToast } from '../lib/ToastContext';

// --- Icons ---
const Icons = {
  plus: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  bill: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  product: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  order: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  revenue: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  active: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const quickActions = [
  { title: "New Order", sub: "Ctrl + O", icon: Icons.plus, path: "/orders" },
  { title: "View Bills", sub: "Ctrl + B", icon: Icons.bill, path: "/bill-history" },
  { title: "Manage Products", sub: "Ctrl + P", icon: Icons.product, path: "/product-management" },
];

const summaryCards = [
  { title: "Today's Orders", key: "todayOrders", icon: Icons.order },
  { title: "Today's Revenue", key: "todayRevenue", icon: Icons.revenue, isCurrency: true },
  { title: "Active Products", key: "activeProducts", icon: Icons.active },
];

const productPieColors = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444',
  '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6', '#a855f7',
  '#6b7280'
];

// --- Unified Pie Chart Component (Adapted for Dashboard counts) ---
const PieChart = ({ data, colors, size = 'md' }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dim = size === 'sm' ? 'w-28 h-28' : 'w-36 h-36';
  const textMain = size === 'sm' ? 'text-sm' : 'text-lg';
  const textSub = size === 'sm' ? 'text-[8px]' : 'text-[9px]';

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center ${dim} text-sm text-neutral-400`}>
        No data
      </div>
    );
  }

  let cumulativePercent = 0;
  const slices = data.map((item, index) => {
    const percent = (item.value / total) * 100;
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
        <span className={`${textMain} font-bold text-neutral-900`}>{total}</span>
        <span className={`${textSub} text-neutral-500 uppercase`}>Total</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res.data);
      } catch (error) {
        showToast("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [showToast]);

  // --- Map data to standardized format for Pie Charts ---
  const prodPieData = useMemo(() =>
    (data?.topProducts || []).map(p => ({ _id: p.name, value: p.quantity })),
    [data?.topProducts]);

  const payPieData = useMemo(() =>
    (data?.paymentDistribution || []).map(p => ({ _id: p.type, value: p.count }))
      .sort((a, b) => b.value - a.value),
    [data?.paymentDistribution]);

  const typePieData = useMemo(() =>
    (data?.orderTypeDistribution || []).map(o => ({ _id: o.type, value: o.count }))
      .sort((a, b) => b.value - a.value),
    [data?.orderTypeDistribution]);

  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

  if (loading) return <div className="flex items-center justify-center h-full"><span className="animate-pulse text-neutral-400">Loading dashboard...</span></div>;

  return (
    <>
      <style>{`
        .dashboard-scroll::-webkit-scrollbar { width: 6px; }
        .dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .dashboard-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .dashboard-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
      `}</style>

      <div className="h-full w-full flex flex-col gap-6 overflow-y-auto p-4 lg:p-6 pb-10 dashboard-scroll">

        {/* HEADER */}
        <div className="flex items-end justify-between flex-shrink-0">
          <h1 className="text-3xl font-extrabold italic text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-neutral-200">{todayDate}</p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          {quickActions.map((action) => (
            <button key={action.title} onClick={() => navigate(action.path)} className="relative bg-white border border-neutral-200 rounded-xl p-5 text-left shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 group">
              <div className="absolute top-4 left-4 p-2 rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-[#fff5f1] group-hover:text-[#ff6d33] transition-colors">{action.icon}</div>
              <div className="pl-12">
                <h3 className="text-base font-bold text-neutral-900">{action.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 font-mono">{action.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          {summaryCards.map((card) => (
            <div key={card.key} className="relative bg-white border border-neutral-200 rounded-xl p-5 text-left shadow-sm">
              <div className="absolute top-4 left-4 p-2 rounded-lg bg-neutral-100 text-neutral-600">{card.icon}</div>
              <div className="pl-12">
                <p className="text-xs font-semibold text-neutral-400 uppercase">{card.title}</p>
                <p className="text-3xl font-extrabold text-neutral-900 mt-2">
                  {card.isCurrency ? `₹${(data?.summary[card.key] || 0).toFixed(2)}` : (data?.summary[card.key] || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT BILLS */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm flex-shrink-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Recent Bills</h2>
            {/* Reserved dark orange ONLY for core navigational actions */}
            <button onClick={() => navigate('/bill-history')} className="text-xs font-semibold text-[#ff6d33] hover:underline">View more &gt;</button>
          </div>

          <div className="grid grid-cols-5 gap-4 px-5 py-2 border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            <div>Date</div>
            <div>Operator</div>
            <div>Type</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Payment</div>
          </div>

          {data?.recentBills?.length === 0 ? (
            <p className="p-5 text-sm text-neutral-400 text-center">No bills today yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {console.log("Raw Bills Data:", data.recentBills)}
              {data.recentBills.map(bill => (
                <div key={bill._id} className="grid grid-cols-5 gap-4 px-5 py-3 items-center hover:bg-neutral-50 transition-colors">
                  <div className="text-xs text-neutral-500 truncate">{formatDateTime(bill.createdAt)}</div>
                  <div className="text-xs text-neutral-900 truncate">{bill.operatorName || 'Unknown'}</div>
                  <div className="flex justify-start">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-neutral-100 text-neutral-600 w-20 text-center">
                      {bill.orderType ? bill.orderType.replace(/-/g, ' ') : '—'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-neutral-900 text-right">₹{bill.totalAmount.toFixed(2)}</div>
                  <div className="flex justify-end">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-neutral-100 text-neutral-600 w-16 text-center">{bill.paymentType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NEW ANALYTICS-STYLE TRIO ROW: Products (Left 3/5) + Payments & Order Types (Right Stacked 2/5) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-shrink-0">

          {/* Products Pie — LEFT (3/5 width) */}
          <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50 shrink-0">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Top Products Today
              </h2>
            </div>
            <div className="p-6 flex-1 flex items-center">
              <div className="flex items-center gap-10 w-full">
                <PieChart data={prodPieData} colors={productPieColors} size="md" />
                <div className="flex flex-col gap-3 min-w-0">
                  {prodPieData.length === 0 ? (
                    <p className="text-sm text-neutral-400">No products sold yet.</p>
                  ) : (
                    prodPieData.map((prod, i) => {
                      const total = prodPieData.reduce((s, p) => s + p.value, 0);
                      const percent = total > 0 ? ((prod.value / total) * 100).toFixed(1) : '0';
                      return (
                        <div key={prod._id} className="flex items-center gap-2.5">
                          <div
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: productPieColors[i] }}
                          />
                          <span className="text-sm text-neutral-900 truncate font-medium flex-1 min-w-0">{prod._id}
                          </span>
                          <span className="text-xs text-neutral-500 shrink-0 tabular-nums">
                            {prod.value} qty
                          </span>
                          <span className="text-xs font-bold text-neutral-900 shrink-0 tabular-nums pl-1">
                            {percent}%
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Container (2/5 width) */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Payment Distribution */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                  Payments
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-5">
                  <PieChart data={payPieData} colors={['#64748b', '#94a3b8', '#cbd5e1']} size="sm" />
                  <div className="flex flex-col gap-2.5 min-w-0">
                    {payPieData.map((p, i) => {
                      const total = payPieData.reduce((s, item) => s + item.value, 0);
                      const percent = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0';
                      const bgColors = ['bg-slate-500', 'bg-slate-400', 'bg-slate-300'];
                      return (
                        <div key={p._id} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColors[i]}`} />
                          <span className="text-xs text-neutral-900 capitalize truncate flex-1 min-w-0">{p._id}
                          </span>
                          <span className="text-[11px] text-neutral-500 shrink-0 tabular-nums">
                            {p.value}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-900 shrink-0 tabular-nums pl-1">
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
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                  Order Types
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-5">
                  <PieChart data={typePieData} colors={['#d97757', '#9ca3af', '#fbbf24']} size="sm" />
                  <div className="flex flex-col gap-2.5 min-w-0">
                    {typePieData.map((o, i) => {
                      const total = typePieData.reduce((s, item) => s + item.value, 0);
                      const percent = total > 0 ? ((o.value / total) * 100).toFixed(1) : '0';
                      const bgColors = ['bg-orange-400', 'bg-gray-400', 'bg-amber-400'];
                      const labels = { 'dine-in': 'Dine-in', takeaway: 'Takeaway' };
                      return (
                        <div key={o._id} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bgColors[i]}`} />
                          <span className="text-xs text-neutral-900 capitalize truncate flex-1 min-w-0">{labels[o._id] || o._id}
                          </span>
                          <span className="text-[11px] text-neutral-500 shrink-0 tabular-nums">
                            {o.value}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-900 shrink-0 tabular-nums pl-1">
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
    </>
  );
};

export default Dashboard;