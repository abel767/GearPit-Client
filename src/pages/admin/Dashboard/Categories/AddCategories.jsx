import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import CategoriesAdd from "../../../../components/Admin/Categories/CategoriesAdd"

function AddCategories() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                <Header />
                < CategoriesAdd/>
              </div>
            </div>
    </>
  )
}

export default AddCategories