/**
 * Revenue Chart Component
 * Biểu đồ doanh thu theo thời gian
 */

import React, { useEffect, useState } from 'react';
import api from '../../../configs/config-axios';
import { AdminLoader } from '../../../Components/Admin';

export default function RevenueChart() {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // Get invoices from last 7 days
      const response = await api.get('/invoices');
      const invoices = response.data?.content || response.data?.data || response.data || [];
      
      // Group by date
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push({
          date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          fullDate: date,
          revenue: 0
        });
      }

      // Sum revenue by date
      if (Array.isArray(invoices)) {
        invoices.forEach(invoice => {
          const invoiceDate = new Date(invoice.createdDate || invoice.issueDate);
          invoiceDate.setHours(0, 0, 0, 0);
          
          const dayData = last7Days.find(d => d.fullDate.getTime() === invoiceDate.getTime());
          if (dayData) {
            dayData.revenue += (invoice.amount || invoice.totalAmount || 0);
          }
        });
      }

      setRevenueData(last7Days);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <AdminLoader size="md" text="Đang tải dữ liệu doanh thu..." />
      </div>
    );
  }

  if (revenueData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-3">💰</div>
        <p className="text-gray-500">Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / revenueData.length;

  return (
    <div className="space-y-4">
      {/* Chart Area - Simple Bar Chart */}
      <div className="h-64 flex items-end justify-between gap-2">
        {revenueData.map((item, index) => {
          const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end items-center" style={{ height: '200px' }}>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer group relative"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.revenue.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>
              {/* Date Label */}
              <span className="text-xs text-gray-600 font-medium">{item.date}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Tổng 7 ngày</p>
          <p className="text-lg font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Trung bình/ngày</p>
          <p className="text-lg font-bold text-gray-900">
            {Math.round(avgRevenue).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Cao nhất</p>
          <p className="text-lg font-bold text-green-600">
            {maxRevenue.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
      </div>
    </div>
  );
}
