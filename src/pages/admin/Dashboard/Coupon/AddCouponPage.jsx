// import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import AddCoupon from "../../../../components/Admin/Coupon/AddCoupon"
function AddCouponPage() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                {/* <Header /> */}
                < AddCoupon/>
              </div>
            </div>
    </>
  )
}

export default AddCouponPage