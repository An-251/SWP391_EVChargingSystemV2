import React from 'react';
import { Card } from 'antd';
import { useSelector } from 'react-redux';

const EmployeeDashboardSimple = () => {
  const user = useSelector((state) => state.auth.user);

  console.log('🔍 Employee Dashboard Simple - Rendering');
  console.log('👤 User:', user);

  try {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Employee Dashboard (Simple Test)</h1>
        
        <Card title="User Information" className="mb-4">
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>

        <Card title="Debug Info">
          <ul className="list-disc pl-5 space-y-2">
            <li>Username: {user?.username || 'N/A'}</li>
            <li>Full Name: {user?.fullName || 'N/A'}</li>
            <li>Role: {user?.role || 'N/A'}</li>
            <li>Employee ID: {user?.employeeId || 'N/A'}</li>
            <li>Facility ID: {user?.facilityId || 'N/A'}</li>
            <li>Facility Name: {user?.facilityName || 'N/A'}</li>
            <li>Position: {user?.position || 'N/A'}</li>
          </ul>
        </Card>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-semibold">✅ Dashboard loaded successfully!</p>
          <p className="text-sm text-green-600 mt-1">
            If you see this, the component is rendering correctly.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error rendering EmployeeDashboardSimple:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h2 className="text-red-800 font-bold mb-2">Error in Dashboard</h2>
          <pre className="text-sm text-red-600">{error.toString()}</pre>
        </div>
      </div>
    );
  }
};

export default EmployeeDashboardSimple;
