import { useState, useEffect } from 'react'
import { Calendar, Plus, Search, Filter, MoreVertical, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ActionDropdown = ({ isOpen, onClose, position, onToggleStatus, status }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-50 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={onToggleStatus}
        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        {status === 'Active' ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
};

export default function AdminCoupons() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coupons, setCoupons] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [dropdownState, setDropdownState] = useState({
    isOpen: false,
    couponId: null,
    position: { top: 0, left: 0 }
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchCoupons()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-button')) {
        setDropdownState(prev => ({ ...prev, isOpen: false }))
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/coupons')
      setCoupons(response.data.coupons || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }
  
  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`http://localhost:3000/admin/coupons/${id}/toggle`)
      fetchCoupons()
      setDropdownState(prev => ({ ...prev, isOpen: false }))
    } catch (error) {
      console.error('Error toggling coupon status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axios.delete(`http://localhost:3000/admin/coupons/${id}`)
        fetchCoupons()
      } catch (error) {
        console.error('Error deleting coupon:', error)
      }
    }
  }

  const toggleDropdown = (event, couponId) => {
    event.stopPropagation()
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    setDropdownState(prev => ({
      isOpen: prev.couponId === couponId ? !prev.isOpen : true,
      couponId,
      position: {
        top: rect.bottom + window.scrollY,
        left: rect.left - 120, // Offset to align menu with button
      }
    }))
  }

  const filteredCoupons = coupons?.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDateRange = (!startDate || new Date(coupon.startDate) >= new Date(startDate)) &&
                           (!endDate || new Date(coupon.expiryDate) <= new Date(endDate))
    return matchesSearch && matchesDateRange
  }) || []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
          <button 
            onClick={() => navigate('/admin/addcoupons')} 
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Coupon
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Start Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-9 pr-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search coupons..."
            />
          </div>

          <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Coupon Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Max
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Min
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-600 font-medium">
                      {coupon.discount}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{coupon.maxDiscount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{coupon.minPurchase}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(coupon.startDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          coupon.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => toggleDropdown(e, coupon._id)}
                          className="action-button text-gray-400 hover:text-gray-500"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dropdown Portal */}
      <ActionDropdown
        isOpen={dropdownState.isOpen}
        onClose={() => setDropdownState(prev => ({ ...prev, isOpen: false }))}
        position={dropdownState.position}
        onToggleStatus={() => handleToggleStatus(dropdownState.couponId)}
        status={coupons.find(c => c._id === dropdownState.couponId)?.status}
      />
    </div>
  )
}