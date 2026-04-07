import React from 'react';
import Card from '../components/ui/Card';

const Orders = () => {
  const title = "Orders"; // Change this per file

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <Card className="text-center max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">Coming soon. This module is currently under development.</p>
      </Card>
    </div>
  );
};

export default Orders;