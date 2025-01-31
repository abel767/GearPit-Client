import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, ShoppingBag, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import TopAnalytics from './TopAnalytics';
export default function Dashboard() {
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    items: 0,
    revenue: 0
  });
  const [originalRevenueData, setOriginalRevenueData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [mostSoldCategories, setMostSoldCategories] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [dateFilter, setDateFilter] = useState('6m');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
        
        const [
          todayResponse, 
          revenueResponse, 
          categoriesResponse, 
          productsResponse,
          usersResponse
        ] = await Promise.all([
          fetch(`${baseUrl}/admin/sales/today-analytics`),
          fetch(`${baseUrl}/admin/sales/revenue`),
          fetch(`${baseUrl}/admin/sales/most-sold-categories`),
          fetch(`${baseUrl}/admin/sales/most-sold-products`),
          fetch(`${baseUrl}/admin/user-count`)
        ]);

        if (!todayResponse.ok || !revenueResponse.ok || !categoriesResponse.ok || 
            !productsResponse.ok || !usersResponse.ok) {
          throw new Error('One or more API calls failed');
        }

        const todayData = await todayResponse.json();
        const revenueData = await revenueResponse.json();
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        const usersData = await usersResponse.json();

        const formattedRevenueData = revenueData.data.map(item => ({
          ...item,
          formattedDate: new Date(item._id).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          })
        }));

        setTodayStats(todayData.data);
        setOriginalRevenueData(formattedRevenueData);
        setRevenueData(formattedRevenueData);
        setMostSoldCategories(categoriesData.data);
        setUserCount(usersData.count);
        setMostSoldProducts(productsData.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // You might want to add error state handling here
      }
    };

    fetchDashboardData();
  }, []);


  const filterRevenue = (filter) => {
    if (!originalRevenueData.length) return;
  
    const now = new Date();
    let filteredData = [];
    const filterDate = new Date();
  
    // Set the filter date based on the selected filter
    switch(filter) {
      case '1m':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filteredData = [...originalRevenueData];
    }
    
    // Filter the data if a specific time range was selected
    if (filter !== 'all') {
      filteredData = originalRevenueData.filter(item => {
        const itemDate = new Date(item._id);
        return itemDate >= filterDate;
      });
    }
  
    // Sort the filtered data by date
    filteredData.sort((a, b) => new Date(a._id) - new Date(b._id));
    
    setRevenueData(filteredData);
    setDateFilter(filter);
    setIsFilterOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
              <p className="text-2xl font-bold mt-2">₹{todayStats.sales.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{todayStats.items} items sold</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Revenue</p>
              <p className="text-2xl font-bold mt-2">₹{todayStats.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Profit made today</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Users Count Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold mt-2">{userCount.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Excluding admins</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold">Revenue Overview</h3>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-500">
                  {revenueData.length > 1 && 
                    `${(((revenueData[revenueData.length-1]?.revenue - revenueData[revenueData.length-2]?.revenue) / 
                    revenueData[revenueData.length-2]?.revenue) * 100).toFixed(1)}% vs last month`}
                </span>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 text-sm text-gray-500 hover:bg-gray-100 p-2 rounded"
              >
                <Calendar className="w-4 h-4" />
                <span>{dateFilter}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                  {['1m', '3m', '6m', '1y'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => filterRevenue(filter)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        dateFilter === filter ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {filter === '1m' ? '1 Month' : 
                       filter === '3m' ? '3 Months' : 
                       filter === '6m' ? '6 Months' : 
                       '1 Year'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  labelFormatter={(label) => label}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Most Sold Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-6">Most Sold Categories</h3>
          <div className="space-y-6">
            {mostSoldCategories.map((category) => (
              <div key={category._id}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {category.totalSold} items sold - ₹{category.totalRevenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-6">Most Sold Products</h3>
          <div className="space-y-6">
            {mostSoldProducts.map((product) => (
              <div key={product._id}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{product.product}</span>
                  <span className="text-sm text-gray-500">{product.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${product.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {product.totalSold} items sold - ₹{product.totalRevenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TopAnalytics />

    </div>
  );
}