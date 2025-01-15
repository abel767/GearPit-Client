import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import AdminCoupons from "../../../../components/Admin/Coupon/AdminCoupons"
function CouponPage() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                <Header />
                < AdminCoupons/>
              </div>
            </div>
    </>
  )
}

export default CouponPage