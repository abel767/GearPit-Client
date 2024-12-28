import { useState, useEffect } from 'react';
import axios from 'axios'; 

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [userCount, setUserCount] = useState(0); // State to hold the user count

  // Fetch user count excluding admin
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/user-count'); // Adjust URL if needed
        setUserCount(response.data.count); // Set the user count in the state
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchUserCount(); // Fetch the count when the component mounts
  }, []); // Empty dependency array ensures it runs once on component mount

  // Data for the Total Revenue chart
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],  // X-axis labels (months)
    datasets: [
      {
        label: 'Total Revenue',
        data: [100000, 120000, 150000, 130000, 160000, 200000],  // Data for revenue
        borderColor: 'rgb(75, 192, 192)', // Line color
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Area under the line color
        fill: true, // Fill the area under the line
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500">Today's Sales</h3>
              <p className="text-2xl font-bold">₹100,999</p>
              <p className="text-sm text-gray-500">We have sold 123 items</p>
            </div>
            <div className="h-16 w-16 bg-blue-100 rounded-full"></div>
          </div>
        </div>
  
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500">Today's Revenue</h3>
              <p className="text-2xl font-bold">₹30,000</p>
              <p className="text-sm text-gray-500">Profit made so today so far</p>
            </div>
            <div className="h-16 w-16 bg-green-100 rounded-full"></div>
          </div>
        </div>
  
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500">Users Count</h3>
              <p className="text-2xl font-bold">{userCount}</p> {/* Displaying the user count */}
              <p className="text-sm text-gray-500">Total users signed up (excluding admins)</p>
            </div>
            <div className="h-16 w-16 bg-orange-100 rounded-full"></div>
          </div>
        </div>
      </div>
  
      {/* Chart and Most Sold Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold">Total Revenue</h3>
              <p className="text-2xl font-bold">₹50,23780</p>
              <p className="text-green-500 text-sm">5% than last month</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1">
                <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                <span>Profit</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-3 w-3 bg-gray-300 rounded-full"></span>
                <span>Loss</span>
              </span>
            </div>
          </div>

          {/* Total Revenue Chart */}
          <div className="h-64">
            <Line data={chartData} />
          </div>
        </div>
  
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Most Sold Items</h3>
          <div className="space-y-4">
            {[{ name: 'Helmets', percentage: 70 }, { name: 'Jacket', percentage: 40 }, { name: 'Gloves', percentage: 60 }, { name: 'Boots', percentage: 80 }, { name: 'Pad', percentage: 20 }].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span>{item.name}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  
      {/* Latest Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="font-semibold mb-4">Latest Orders</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4">Order ID</th>
                <th className="pb-4">Product</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Payment</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((item) => (
                <tr key={item} className="border-t">
                  <td className="py-4">302012</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <img src="/placeholder.svg?height=40&width=40" className="h-10 w-10 rounded" />
                      <div>
                        <p>LS2 Helmet</p>
                        <p className="text-sm text-gray-500">+3 Products</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">29 Dec 2022</td>
                  <td className="py-4">Josh Wisley</td>
                  <td className="py-4">₹59900</td>
                  <td className="py-4">24 Jun 2023</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full">
                      Processing
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-blue-500 hover:text-blue-700">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
