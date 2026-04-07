import React from 'react';
import Card from '../components/ui/Card';

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <Card className="text-center max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-pale mb-4">
          <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        {/* Primary Text #111111 */}
        <h3 className="text-lg font-bold text-text-primary mb-1">Dashboard</h3>
        {/* Secondary Text #757575 */}
        <p className="text-sm text-text-secondary">Coming soon. This module is currently under development.</p>
      </Card>
    </div>
  );
};

export default Dashboard;