import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  SlidersHorizontal, 
  Search, 
  ChevronDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedNewStatus, setSelectedNewStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const statusTabs = ['All Status', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed'];
  const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/orders`, {
        headers: {
          'Content-Type': 'application/json',
        },
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

  useEffect(() => {
    fetchOrders();
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
  
      const data = await response.json();
      if (data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus.toLowerCase() }
              : order
          )
        );
        setShowStatusDialog(false);
        setSelectedNewStatus(null);
        setSelectedOrder(null);
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'failed') {
      return 'text-red-500 bg-red-50';
    }

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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = () => {
      if (selectedStatus === 'All Status') return true;
      if (selectedStatus === 'Failed') return order.paymentStatus === 'failed';
      return order.status.toLowerCase() === selectedStatus.toLowerCase();
    };

    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus() && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Mobile Order Card Component
  const OrderCard = ({ order }) => (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium">{order.orderNumber}</div>
          <div className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(order.status, order.paymentStatus)}`}>
          {order.paymentStatus === 'failed' ? 'Failed' : order.status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">Customer</div>
          <div>{order.userId?.name || 'N/A'}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Products</div>
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mt-2">
              {item.productId?.images?.[0] && (
                <img 
                  src={item.productId.images[0]} 
                  alt={item.productId?.productName} 
                  className="w-12 h-12 rounded-md object-cover"
                />
              )}
              <div>
                <div className="font-medium">{item.productId?.productName}</div>
                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="font-medium">₹{order.totalAmount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Payment</div>
            <div className="capitalize">
              {order.paymentMethod}
              {order.paymentStatus === 'failed' && (
                <span className="ml-2 text-red-500 text-xs">
                  (Payment Failed)
                </span>
              )}
            </div>
          </div>
        </div>

        {order.status?.toLowerCase() !== 'cancelled' && order.paymentStatus !== 'failed' && (
          <div className="relative dropdown-container mt-4">
            <button 
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(openDropdownId === order._id ? null : order._id);
              }}
            >
              Update Status
              <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdownId === order._id && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg py-1 z-10">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedOrder(order);
                      setSelectedNewStatus(status);
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
        )}
      </div>
    </div>
  );

  const StatusUpdateModal = ({ show, onClose, onConfirm, orderNumber }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Update Order Status</h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to update the status of order #{orderNumber} to {selectedNewStatus}?
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">Order Management</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            <span className="mx-2">•</span>
            <span>Orders</span>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Download className="w-4 h-4" />
          Export Orders
        </button>
      </div>
  
      <div className="bg-white rounded-lg shadow">
        {/* Filters Section */}
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4">
            {/* Mobile Filter Toggle */}
            <div className="flex sm:hidden justify-between items-center">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <Menu className="w-4 h-4" />
                Filters
              </button>
              <div className="relative flex-1 max-w-xs ml-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Tabs - Scrollable on mobile */}
            <div className="overflow-x-auto">
  <div className="grid grid-cols-3 sm:flex sm:flex-row gap-2 sm:gap-2">
    {statusTabs.map((status) => {
      // Shorten display text for mobile
      const displayText = window.innerWidth < 640 
        ? status === 'All Status' 
          ? 'All' 
          : status.slice(0, 4) 
        : status;
        
      return (
        <button
          key={status}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap ${
            selectedStatus === status
              ? 'bg-black text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setSelectedStatus(status)}
        >
          {displayText}
        </button>
      );
    })}
  </div>
</div>

            {/* Desktop Search and Filters */}
            <div className="hidden sm:flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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

            {/* Mobile Filters (Expandable) */}
            {showFilters && (
              <div className="sm:hidden space-y-4 pt-4 border-t">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <SlidersHorizontal className="w-4 h-4" />
                  More Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-4 text-center">Loading orders...</div>
          ) : currentOrders.length === 0 ? (
            <div className="p-4 text-center">No orders found</div>
          ) : (
            <div className="p-4">
              {currentOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop/Tablet View */}
        <div className="hidden sm:block overflow-x-auto">
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
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">No orders found</td>
                </tr>
              ) : (
                currentOrders.map((order) => (
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
                    <td className="px-6 py-4 text-sm capitalize">
                      {order.paymentMethod}
                      {order.paymentStatus === 'failed' && (
                        <span className="ml-2 text-red-500 text-xs">
                          (Payment Failed)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(order.status, order.paymentStatus)}`}>
                        {order.paymentStatus === 'failed' ? 'Failed' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.status?.toLowerCase() !== 'cancelled' && order.paymentStatus !== 'failed' && (
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
                                    setSelectedNewStatus(status);
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
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Responsive */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t gap-4">
            <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-left">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => page !== '...' && setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : page === '...'
                      ? 'text-gray-500 cursor-default'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        show={showStatusDialog}
        onClose={() => {
          setShowStatusDialog(false);
          setSelectedNewStatus(null);
          setSelectedOrder(null);
        }}
        onConfirm={() => {
          if (selectedOrder && selectedNewStatus) {
            updateOrderStatus(selectedOrder._id, selectedNewStatus);
          }
        }}
        orderNumber={selectedOrder?.orderNumber}
      />
    </div>
  );

}

