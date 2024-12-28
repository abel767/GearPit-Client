import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import AddProduct from "../../../../components/Admin/product/Addproduct"
function ProductEdit() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                <Header />
                <AddProduct />
              </div>
            </div>
    </>
  )
}

export default ProductEdit