import { useState, useEffect } from 'react';
import { 
   
  Download, 
  Calendar, 
  SlidersHorizontal, 
  Search, 
  ChevronDown,
  Check,
  X 
} from 'lucide-react';

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const statusTabs = ['All Status', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/orders', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
    const endpoint = newStatus.toLowerCase() === 'cancelled' 
        ? `http://localhost:3000/user/orders/${orderId}/cancel`
        : `http://localhost:3000/admin/orders/${orderId}/status`;

      const method = newStatus.toLowerCase() === 'cancelled' ? 'PUT' : 'PATCH';
      const body = newStatus.toLowerCase() === 'cancelled' 
        ? {}
        : { status: newStatus };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success || data.data) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-50';
      case 'processing':
        return 'text-orange-500 bg-orange-50';
      case 'shipped':
        return 'text-blue-500 bg-blue-50';
      case 'delivered':
        return 'text-green-500 bg-green-50';
      case 'cancelled':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus;
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const csv = [
      ['Order ID', 'Date', 'Customer', 'Products', 'Total', 'Payment Method', 'Status'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        new Date(order.createdAt).toLocaleDateString(),
        order.userId?.name || 'N/A',
        order.items.map(item => `${item.productId?.productName} (${item.quantity})`).join(', '),
        `₹${order.totalAmount}`,
        order.paymentMethod,
        order.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Modal component using Tailwind
  const StatusUpdateModal = ({ show, onClose, onConfirm, orderNumber }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Update Order Status</h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to update the status of order #{orderNumber}?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Order Management</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            <span className="mx-2">•</span>
            <span>Orders</span>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Download className="w-4 h-4" />
          Export Orders
        </button>
      </div>
  
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {statusTabs.map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap ${
                    selectedStatus === status
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Calendar className="w-4 h-4" />
                Date Range
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Products</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.userId?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {item.productId?.images?.[0] && (
                              <img 
                                src={item.productId.images[0]} 
                                alt={item.productId?.productName} 
                                className="w-12 h-12 rounded-md object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.productId?.productName}</div>
                              <div className="text-gray-500">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">₹{order.totalAmount}</td>
                    <td className="px-6 py-4 text-sm capitalize">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative dropdown-container">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === order._id ? null : order._id);
                          }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                        {openDropdownId === order._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowStatusDialog(true);
                                  setOpenDropdownId(null);
                                }}
                              >
                                Mark as {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  
      <StatusUpdateModal
        show={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={() => {
          if (selectedOrder) {
            updateOrderStatus(selectedOrder._id, selectedStatus);
          }
          setShowStatusDialog(false);
        }}
        orderNumber={selectedOrder?.orderNumber}
      />
    </div>
  );
  
}