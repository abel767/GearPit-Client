import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CreditCard, Wallet, ArrowDownRight, ArrowUpRight, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

function UserWallet() {
  const { user } = useSelector((state) => state.user);
  const [walletData, setWalletData] = useState({
    balance: 0,
    monthlySpending: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelStatus, setCancelStatus] = useState({ message: '', type: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Rest of the existing fetch and handler functions remain the same...
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

  useEffect(() => {
    fetchWalletDetails();
  }, [user?._id]);

  useEffect(() => {
    // Reset to first page when search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredTransactions = walletData.transactions?.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const monthlyBudget = 1000;
  const budgetPercentage = Math.min(((walletData.monthlySpending || 0) / monthlyBudget) * 100, 100);

  // Pagination component
  const Pagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === number 
                ? 'bg-black text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header section remains the same */}
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
        {/* Status and cards section remains the same */}
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

        {/* Transactions section with pagination */}
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
            {currentTransactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              currentTransactions.map((transaction) => (
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
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredTransactions.length > itemsPerPage && <Pagination />}
        </div>
      </main>
    </div>
  );
}

export default UserWallet;