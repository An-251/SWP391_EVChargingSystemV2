import React, { useState } from 'react';
import { Tabs } from 'antd';
import { FileText, List } from 'lucide-react';
import AdminInvoiceManagement from './AdminInvoiceManagement';
import AllInvoicesView from './AllInvoicesView';

const { TabPane } = Tabs;

/**
 * AdminInvoicesDashboard - Main admin invoices page
 * Combines invoice generation and viewing functionality
 */
const AdminInvoicesDashboard = () => {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        className="px-6 pt-6"
        tabBarStyle={{
          backgroundColor: 'white',
          padding: '0 20px',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <TabPane
          tab={
            <span className="flex items-center">
              <FileText className="mr-2" size={18} />
              Tạo hóa đơn
            </span>
          }
          key="generate"
        >
          <AdminInvoiceManagement />
        </TabPane>

        <TabPane
          tab={
            <span className="flex items-center">
              <List className="mr-2" size={18} />
              Danh sách hóa đơn
            </span>
          }
          key="view"
        >
          <AllInvoicesView />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminInvoicesDashboard;
