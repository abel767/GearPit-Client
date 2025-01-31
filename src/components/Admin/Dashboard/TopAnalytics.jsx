import  { useState, useEffect } from 'react';

const TopAnalytics = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    const fetchTopAnalytics = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${baseUrl}/admin/sales/top-products`),
          fetch(`${baseUrl}/admin/sales/top-categories`)
        ]);
    
        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }
    
        const products = await productsRes.json();
        const categories = await categoriesRes.json();
    
        console.log('Top Products Response:', products);
        console.log('Top Categories Response:', categories);
    
        if (products.success && categories.success) {
          setTopProducts(products.data || []);
          setTopCategories(categories.data || []);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchTopAnalytics();
  }, []);

  const AnalyticsSection = ({ title, data }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-6">{title}</h3>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-gray-500 text-sm">No data available</div>
      ) : (
        <div className="space-y-6">
          {data.map((item) => (
            <div key={item._id}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-gray-500">
                  {item.percentage?.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {item.totalSold.toLocaleString()} items sold - ₹{item.totalRevenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnalyticsSection title="Top Products" data={topProducts} />
      <AnalyticsSection title="Top Categories" data={topCategories} />
    </div>
  );
};

export default TopAnalytics;