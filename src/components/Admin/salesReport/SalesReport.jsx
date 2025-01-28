import  { useState, useEffect } from 'react';
import { 
  
  FileSpreadsheet,
  FileDown,
  Calendar,
  
  DollarSign,
  Package,
  Percent
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
          <p className="text-gray-500 mt-1">View and download sales reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleDownload('excel')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border rounded-md px-3 py-2 text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold mt-2">{reportData.summary.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold mt-2">₹{reportData.summary.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            {/* <div>
              <p className="text-gray-500 text-sm font-medium">Total Discount</p>
              <p className="text-2xl font-bold mt-2">₹{reportData.summary.totalDiscount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Percent className="w-6 h-6 text-orange-600" />
            </div> */}
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-gray-800">Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.dailyBreakdown.map((day) => (
                <tr key={day._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{day.amount.toLocaleString()}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{day.discount.toLocaleString()}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}