import React from 'react';

const MIN_DATE_VALUE = '2018-01-01';

const DateFilterBar = ({
  activeFilter,
  fromDate,
  toDate,
  onThisMonthClick,
  onFromDateChange,
  onToDateChange
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <button
          type="button"
          onClick={onThisMonthClick}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all lg:min-w-[140px] ${
            activeFilter === 'month'
              ? 'border border-red-500/30 bg-red-50 text-red-500 shadow-sm'
              : 'border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'
          }`}
        >
          This Month
        </button>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              min={MIN_DATE_VALUE}
              max={toDate || undefined}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              min={fromDate || MIN_DATE_VALUE}
              max={undefined}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default DateFilterBar;
