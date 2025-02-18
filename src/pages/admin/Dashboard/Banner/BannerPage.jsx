// import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import BannerManagement from "../../../../components/Admin/Banner/BannerManagement"
function BannerPage() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                {/* <Header /> */}
                < BannerManagement/>
              </div>
            </div>
    </>
  )
}

export default BannerPage