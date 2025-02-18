import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet,
  FileDown,
  Calendar,
  DollarSign,
  Package,
  Percent,
  ChevronDown
} from 'lucide-react';

export default function SalesReport() {
  const [reportData, setReportData] = useState({
    summary: {
      totalOrders: 0,
      totalAmount: 0,
      totalDiscount: 0
    },
    dailyBreakdown: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: dateRange.endDate || new Date().toISOString().split('T')[0]
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/sales/report?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleDownload = async (format) => {
    const queryParams = new URLSearchParams({
      startDate: dateRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: dateRange.endDate || new Date().toISOString().split('T')[0]
    });

    const endpoint = format === 'excel' 
      ? `${import.meta.env.VITE_BACKEND_URL}/admin/sales/report/excel`
      : `${import.meta.env.VITE_BACKEND_URL}/admin/sales/report/pdf`;

    window.open(`${endpoint}?${queryParams}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Sales Report</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">View and download sales reports</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleDownload('excel')}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <button 
          className="w-full flex items-center justify-between md:hidden mb-4"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <span className="text-sm font-medium text-gray-600">Filter by Date</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Date Range:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
              />
              <span className="text-gray-500 hidden sm:block">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
              />
              <button
                onClick={fetchReportData}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <p className="text-xl md:text-2xl font-bold mt-2">{reportData.summary.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-xl md:text-2xl font-bold mt-2">₹{reportData.summary.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Average Order Value</p>
              <p className="text-xl md:text-2xl font-bold mt-2">
                ₹{reportData.summary.totalOrders ? 
                  (reportData.summary.totalAmount / reportData.summary.totalOrders).toFixed(2) : 
                  '0'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b">
          <h2 className="font-semibold text-gray-800">Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.dailyBreakdown.map((day) => (
                <tr key={day._id}>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-900">{day._id}</td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-900">{day.orders}</td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-900">₹{day.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}