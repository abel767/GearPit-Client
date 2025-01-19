import { useState } from 'react'
import { ArrowLeft, Calendar, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../../api/axiosInstance'
export default function AddCoupon() {
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    maxDiscount: '',
    minPurchase: '',
    startDate: '',
    expiryDate: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate dates
      if (new Date(formData.startDate) >= new Date(formData.expiryDate)) {
        setError('Start date must be before expiry date')
        return
      }

      const response = await axiosInstance.post('/admin/coupons', formData)
      
      if (response.data.status === 'success') {
        navigate('/admin/coupons')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/coupons')}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Coupon</h1>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code */}
            <div className="space-y-1">
              <label htmlFor="code" className="text-sm font-medium text-gray-900">
                Coupon Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter coupon code"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Coupon code must be unique and contain only letters and numbers
              </p>
            </div>

            {/* Discount */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="discount" className="text-sm font-medium text-gray-900">
                  Discount Percentage
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 pl-4 pr-12 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter discount"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="maxDiscount" className="text-sm font-medium text-gray-900">
                  Maximum Discount Amount
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 pl-8 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter max discount"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Minimum Purchase */}
            <div className="space-y-1">
              <label htmlFor="minPurchase" className="text-sm font-medium text-gray-900">
                Minimum Purchase Amount
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  id="minPurchase"
                  type="number"
                  min="0"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 pl-8 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter minimum purchase amount"
                  required
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-900">
                  Start Date
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="expiryDate" className="text-sm font-medium text-gray-900">
                  Expiry Date
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Important Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Coupon codes must be unique</li>
                      <li>Maximum discount cannot exceed the purchase amount</li>
                      <li>Start date must be before expiry date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/coupons')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}