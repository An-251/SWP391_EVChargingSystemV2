/**
 * Reports Page - Revenue & Usage Analytics
 */

import React, { useState } from 'react';
import RevenueReport from './RevenueReport';
import UsageReport from './UsageReport';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">View revenue reports and usage statistics</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'revenue'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📊 Revenue Report
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'usage'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ⚡ Usage Report
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'revenue' ? <RevenueReport /> : <UsageReport />}
        </div>
      </div>
    </div>
  );
}
