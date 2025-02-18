// import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import EditProduct from "../../../../components/Admin/product/EditProduct"
function ProductEdit() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                {/* <Header /> */}
                <EditProduct />
              </div>
            </div>
    </>
  )
}

export default ProductEdit