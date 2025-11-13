import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../configs/config-axios';
import { 
  PAYMENT_REQUEST_STATUS, 
  getPaymentRequestStatusText, 
  getPaymentRequestStatusColor 
} from '../../constants/paymentStatus';

const EmployeeCashPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(PAYMENT_REQUEST_STATUS.PENDING);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  
  const employeeData = useSelector((state) => state.auth.user);
  const facilityId = employeeData?.facilityId;
  const employeeId = employeeData?.employeeId;

  useEffect(() => {
    if (facilityId) {
      fetchPayments();
    }
  }, [facilityId, filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = filter === PAYMENT_REQUEST_STATUS.PENDING
        ? `/cash-payments/facility/${facilityId}/pending`
        : `/cash-payments/facility/${facilityId}${filter !== 'ALL' ? `?status=${filter}` : ''}`;
      
      const response = await axios.get(endpoint);
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (payment, type) => {
    setSelectedPayment(payment);
    setActionType(type);
    setShowModal(true);
    setNotes('');
  };

  const confirmAction = async () => {
    if (!selectedPayment || !employeeId) {
      console.error('❌ Missing required data:', { selectedPayment, employeeId });
      alert('Thiếu thông tin nhân viên. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const endpoint = `/cash-payments/${selectedPayment.id}/${actionType}`;
      const payload = {
        employeeId: employeeId,
        notes: notes || (actionType === 'approve' ? 'Approved' : 'Rejected')
      };

      console.log('📤 Sending approval request:', { endpoint, payload });
      const response = await axios.put(endpoint, payload);
      console.log('✅ Approval response:', response.data);
      
      if (response.data.success) {
        alert(`Payment ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setShowModal(false);
        fetchPayments(); // Refresh list
      }
    } catch (error) {
      console.error(`❌ Error ${actionType}ing payment:`, error);
      console.error('❌ Error response:', error.response?.data);
      alert(`Failed to ${actionType} payment: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    const color = getPaymentRequestStatusColor(status);
    const colorMap = {
      'blue': 'bg-blue-100 text-blue-800',
      'green': 'bg-green-100 text-green-800',
      'red': 'bg-red-100 text-red-800',
      'orange': 'bg-orange-100 text-orange-800',
      'gray': 'bg-gray-100 text-gray-800',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const getRequestTypeLabel = (type) => {
    return type === 'INVOICE' ? '🧾 Invoice' : '📋 Subscription';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💰 Cash Payment Approvals</h1>
        <p className="text-gray-600">Manage cash payment requests from drivers</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[PAYMENT_REQUEST_STATUS.PENDING, PAYMENT_REQUEST_STATUS.APPROVED, PAYMENT_REQUEST_STATUS.REJECTED, 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === status
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status === 'ALL' ? 'TẤT CẢ' : getPaymentRequestStatusText(status)}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No {filter.toLowerCase()} payments found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getRequestTypeLabel(payment.requestType)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getPaymentRequestStatusText(payment.status)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">
                    Driver: {payment.driverName || 'Unknown'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Phone:</strong> {payment.driverPhone || 'N/A'}</p>
                      <p><strong>Amount:</strong> <span className="text-green-600 font-bold">${payment.amount}</span></p>
                      <p><strong>Reference ID:</strong> #{payment.referenceId}</p>
                    </div>
                    <div>
                      <p><strong>Facility:</strong> {payment.facilityName}</p>
                      <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
                      {payment.approvedAt && (
                        <p><strong>Processed:</strong> {new Date(payment.approvedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {payment.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Notes:</strong> {payment.notes}</p>
                    </div>
                  )}

                  {payment.approvalNotes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm"><strong>Approval Notes:</strong> {payment.approvalNotes}</p>
                      {payment.approvedByEmployeeName && (
                        <p className="text-xs text-gray-600 mt-1">By: {payment.approvedByEmployeeName}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {payment.status === PAYMENT_REQUEST_STATUS.PENDING && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAction(payment, 'approve')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleAction(payment, 'reject')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'approve' ? '✓ Approve Payment' : '✗ Reject Payment'}
            </h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Driver:</strong> {selectedPayment.driverName}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Amount:</strong> <span className="text-green-600 font-bold">${selectedPayment.amount}</span>
              </p>
              <p className="text-gray-700">
                <strong>Type:</strong> {selectedPayment.requestType}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder={actionType === 'approve' ? 'Optional approval notes' : 'Required: Reason for rejection'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={actionType === 'reject' && !notes.trim()}
                className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCashPayments;
