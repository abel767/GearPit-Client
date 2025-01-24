import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    items: 0,
    revenue: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [mostSoldCategories, setMostSoldCategories] = useState([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [todayResponse, revenueResponse, categoriesResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:3000/admin/sales/today-analytics'),
          fetch('http://localhost:3000/admin/sales/revenue'),
          fetch('http://localhost:3000/admin/sales/most-sold-categories'),
          fetch('http://localhost:3000/admin/user-count')
        ]);

        const todayData = await todayResponse.json();
        const revenueData = await revenueResponse.json();
        const categoriesData = await categoriesResponse.json();
        const usersData = await usersResponse.json();

        setTodayStats(todayData.data);
        setRevenueData(revenueData.data);
        setMostSoldCategories(categoriesData.data);
        setUserCount(usersData.count);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last 6 months</span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
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
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
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
      </div>
    </div>
  );
}