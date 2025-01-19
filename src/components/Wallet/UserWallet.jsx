import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CreditCard, Wallet, ArrowDownRight, ArrowUpRight, Search, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
function UserWallet() {
  const { user } = useSelector((state) => {
    console.log('Redux State:', state); // Debug Redux state
    return state.user;
  });
  const [walletData, setWalletData] = useState({
    balance: 0,
    monthlySpending: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelStatus, setCancelStatus] = useState({ message: '', type: '' });

  const fetchWalletDetails = async () => {
    if (!user?._id) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get(`/user/wallet/${user._id}`);
      
      if (data.success) {
        setWalletData(data.data);
      } else {
        setError('Failed to fetch wallet data');
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch wallet details');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCancellation = async (orderId) => {
    try {
      setCancelStatus({ message: 'Processing cancellation...', type: 'info' });
      
      const cancelResponse = await axiosInstance.put(`user/orders/${orderId}/cancel`);
      
      if (cancelResponse.data.success) {
        const orderDetails = await axiosInstance.get(`/user/orders/detail/${orderId}`);
        const refundAmount = orderDetails.data.data.totalAmount;

        const refundResponse = await axiosInstance.post('/user/wallet/refund', {
          userId: user._id,
          orderId: orderId,
          amount: refundAmount
        });

        if (refundResponse.data.success) {
          setCancelStatus({ message: 'Order cancelled and refunded successfully', type: 'success' });
          await fetchWalletDetails();
          return true;
        }
      }
      setCancelStatus({ message: 'Failed to cancel order', type: 'error' });
      return false;
    } catch (err) {
      console.error('Error during order cancellation:', err);
      setCancelStatus({ message: err.response?.data?.message || 'Error processing cancellation', type: 'error' });
      return false;
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [user?._id]);

  const filteredTransactions = walletData.transactions?.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const monthlyBudget = 1000;
  const budgetPercentage = Math.min(((walletData.monthlySpending || 0) / monthlyBudget) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8" />
              <span className="text-xl font-semibold">Wallet</span>
            </div>
            {error && (
              <div className="mt-4 bg-red-100 text-red-800 p-4 rounded-md">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {cancelStatus.message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              cancelStatus.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p>{cancelStatus.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-black text-white p-8 rounded-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm text-gray-400">Available Balance</p>
                <h2 className="text-3xl font-semibold mt-1">
                  ${walletData.balance?.toFixed(2)}
                </h2>
              </div>
              <CreditCard className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm text-gray-500">Monthly Spending</p>
                <h2 className="text-3xl font-semibold mt-1">
                  ${walletData.monthlySpending?.toFixed(2)}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-black rounded-full transition-all duration-500" 
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {budgetPercentage.toFixed(0)}% of monthly budget
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Recent Transactions</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl">
            {filteredTransactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-6 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.status}</p>
                    {transaction.orderId && (
                      <button
                        className="mt-2 border border-black text-black py-1 px-2 rounded-md hover:bg-gray-100"
                        onClick={() => handleOrderCancellation(transaction.orderId)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserWallet;
