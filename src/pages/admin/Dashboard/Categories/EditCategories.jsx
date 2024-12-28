import Header from "../../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar"
import CategoriesEdit from "../../../../components/Admin/Categories/CategoriesEdit"
function EditCategories() {
  return (
    <>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1">
                <Header />
                < CategoriesEdit/>
              </div>
            </div>
    </>
  )
}

export default EditCategories