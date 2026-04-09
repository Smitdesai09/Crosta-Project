import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useToast } from '../context/ToastContext';

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
  { title: "New Order", sub: "Ctrl + O", icon: Icons.plus, path: "/orders", color: "text-blue-600 bg-blue-50" },
  { title: "View Bills", sub: "Ctrl + B", icon: Icons.bill, path: "/bill-history", color: "text-purple-600 bg-purple-50" },
  { title: "Manage Products", sub: "Ctrl + P", icon: Icons.product, path: "/product-management", color: "text-emerald-600 bg-emerald-50" },
];

const summaryCards = [
  { title: "Today's Orders", key: "todayOrders", icon: Icons.order, color: "text-blue-600 bg-blue-50" },
  { title: "Today's Revenue", key: "todayRevenue", icon: Icons.revenue, color: "text-orange-600 bg-orange-50", isCurrency: true },
  { title: "Active Products", key: "activeProducts", icon: Icons.active, color: "text-emerald-600 bg-emerald-50" },
];

const DonutChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <div className="flex items-center justify-center h-full text-sm text-text-secondary">No data today</div>;

  let cumulativePercent = 0;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {data.map((item, index) => {
          const percent = (item.count / total) * 100;
          const dashArray = `${percent} ${100 - percent}`;
          const dashOffset = -cumulativePercent;
          // eslint-disable-next-line react-hooks/immutability
          cumulativePercent += percent;
          return (
            <circle
              key={item.type}
              cx="18" cy="18" r="15.91549430918954"
              fill="transparent"
              stroke={colors[index] || "#e5e7eb"}
              strokeWidth="3.5"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-text-primary">{total}</span>
        <span className="text-[10px] text-text-secondary uppercase">Total</span>
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
        const res = await orderService.getDashboardData();
        setData(res.data);
      } catch (error) {
        showToast("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [showToast]);

  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

  if (loading) return <div className="flex items-center justify-center h-full"><span className="animate-pulse text-text-secondary">Loading dashboard...</span></div>;

  return (
    <>
      {/* 4. Minimal, hidden-by-default Scrollbar CSS */}
      <style>{`
        .dashboard-scroll::-webkit-scrollbar { width: 6px; }
        .dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .dashboard-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .dashboard-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
      `}</style>

      <div className="h-full w-full flex flex-col gap-6 overflow-y-auto pb-10 dashboard-scroll">
        
        {/* HEADER */}
        <div className="flex items-end justify-between flex-shrink-0">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary font-medium bg-surface-gray px-3 py-1.5 rounded-lg border border-border-main">{todayDate}</p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          {quickActions.map((action) => (
            <button key={action.title} onClick={() => navigate(action.path)} className="relative bg-surface-white border border-border-main rounded-xl p-5 text-left shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
              <div className={`absolute top-4 left-4 p-2 rounded-lg ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}>{action.icon}</div>
              <div className="pl-12">
                <h3 className="text-base font-bold text-text-primary">{action.title}</h3>
                <p className="text-xs text-text-placeholder mt-1 font-mono">{action.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          {summaryCards.map((card) => (
            <div key={card.key} className="relative bg-surface-white border border-border-main rounded-xl p-5 text-left shadow-sm">
              <div className={`absolute top-4 left-4 p-2 rounded-lg ${card.color} opacity-80`}>{card.icon}</div>
              <div className="pl-12">
                <p className="text-xs font-semibold text-text-secondary uppercase">{card.title}</p>
                <p className="text-3xl font-extrabold text-text-primary mt-2">
                  {card.isCurrency ? `₹${(data?.summary[card.key] || 0).toFixed(2)}` : (data?.summary[card.key] || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT BILLS */}
        {/* 1 & 2. Grid columns for perfect equal spacing */}
        <div className="bg-surface-white border border-border-main rounded-xl shadow-sm flex-shrink-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border-main bg-surface-gray flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Recent Bills</h2>
            <button onClick={() => navigate('/bill-history')} className="text-xs font-semibold text-brand hover:underline">View more &gt;</button>
          </div>
          
          {/* Sub-header for exact column alignment */}
          <div className="grid grid-cols-4 gap-4 px-5 py-2 border-b border-border-main bg-surface-gray/50 text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            <div>Date</div>
            <div>Operator</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Payment</div>
          </div>

          {data?.recentBills?.length === 0 ? (
            <p className="p-5 text-sm text-text-secondary text-center">No bills today yet.</p>
          ) : (
            <div className="divide-y divide-border-main">
              {data.recentBills.map(bill => (
                <div key={bill._id} className="grid grid-cols-4 gap-4 px-5 py-3 items-center hover:bg-surface-gray/50 transition-colors">
                  <div className="text-xs text-text-secondary truncate">{formatDateTime(bill.createdAt)}</div>
                  <div className="text-xs text-text-primary truncate">{bill.operatorName || 'Unknown'}</div>
                  <div className="text-sm font-bold text-text-primary text-right">₹{bill.totalAmount.toFixed(2)}</div>
                  <div className="flex justify-end">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-surface-gray border border-border-main text-text-secondary w-16 text-center">{bill.paymentType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-surface-white border border-border-main rounded-xl shadow-sm flex-shrink-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border-main bg-surface-gray">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Top Products Today</h2>
          </div>
          {data?.topProducts?.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">No products sold today yet.</p>
          ) : (
            <div className="divide-y divide-border-main">
              {data.topProducts.map((prod, idx) => (
                <div key={prod.name} className="flex items-center justify-between px-5 py-3 hover:bg-surface-gray/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-surface-gray border border-border-main flex items-center justify-center text-[10px] font-bold text-text-secondary shrink-0">#{idx + 1}</span>
                    <span className="text-sm font-medium text-text-primary truncate">{prod.name}</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary shrink-0 ml-4">{prod.quantity} qty</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
          
          {/* Payment Distribution */}
          {/* 3. Top-left aligned header matching other sections */}
          <div className="bg-surface-white border border-border-main rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border-main bg-surface-gray">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Payment Distribution</h2>
            </div>
            <div className="p-5">
              <DonutChart data={data?.paymentDistribution || []} colors={['#64748b', '#94a3b8', '#cbd5e1']} />
              <div className="flex justify-center gap-4 mt-4">
                {(data?.paymentDistribution || []).map((p, i) => {
                  const total = data.paymentDistribution.reduce((s, i) => s + i.count, 0);
                  const percent = total > 0 ? Math.round((p.count / total) * 100) : 0;
                  const colors = ['bg-slate-500', 'bg-slate-400', 'bg-slate-300'];
                  return (
                    <div key={p.type} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors[i]}`}></div>
                      <span className="capitalize">{p.type}</span>
                      <span className="font-bold text-text-primary">({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Type Distribution */}
          <div className="bg-surface-white border border-border-main rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border-main bg-surface-gray">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">Order Type Distribution</h2>
            </div>
            <div className="p-5">
              <DonutChart data={data?.orderTypeDistribution || []} colors={['#d97757', '#9ca3af']} />
              <div className="flex justify-center gap-4 mt-4">
                {(data?.orderTypeDistribution || []).map((o, i) => {
                  const total = data.orderTypeDistribution.reduce((s, i) => s + i.count, 0);
                  const percent = total > 0 ? Math.round((o.count / total) * 100) : 0;
                  const colors = ['bg-orange-400', 'bg-gray-400'];
                  const labels = { 'dine-in': 'Dine-in', 'takeaway': 'Takeaway' };
                  return (
                    <div key={o.type} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors[i]}`}></div>
                      <span className="capitalize">{labels[o.type] || o.type}</span>
                      <span className="font-bold text-text-primary">({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;