import {Route, Routes} from 'react-router-dom'
import AdminLogin from '../../pages/admin/Login/AdminLogin'
import AdminDashboard from '../../pages/admin/Dashboard/AdminDashboard'
import { AdminProtectRoute, AdminProtectRouteLogin } from '../../protect/ProtectedRoute'
import CustomersList from '../../pages/admin/Dashboard/CustomersList'
// product 
import ProductTable from '../../pages/admin/Dashboard/Product/ProductTable'
import ProductAdd from '../../pages/admin/Dashboard/Product/ProductAdd'
import ProductEdit from '../../pages/admin/Dashboard/Product/ProductEdit'
// category
import CategoriesTable from '../../pages/admin/Dashboard/Categories/CategoriesTable'
import AddCategories from '../../pages/admin/Dashboard/Categories/AddCategories'
import EditCategories from '../../pages/admin/Dashboard/Categories/EditCategories'

//order 
import OrderManagement from '../../pages/admin/OrderManagement/OrderManagement'

function AdminRoute(){
    return(
        <Routes>
            <Route element={<AdminProtectRouteLogin/>}>
            <Route path="/login" element={<AdminLogin />} />
            </Route>
            <Route element={<AdminProtectRoute/>}>
            <Route path='/dashboard' element={<AdminDashboard/>}/>
            <Route path='/data' element={<CustomersList />} />

             {/* Product */}
            <Route path='/productdata' element={<ProductTable />} />
            <Route path='/addproduct' element={<ProductAdd />} />
            <Route path='/editproduct/:id' element={<ProductEdit />} />

            {/* category */}
            <Route path='/categorydata' element={<CategoriesTable />} />
            <Route path='/addcategorydata' element={<AddCategories />} />
            <Route path='/editcategory/:id' element={<EditCategories />} />

            {/* Order Management */}
            <Route path='/Orders' element={<OrderManagement />} />

            </Route>
        </Routes>
    )
}

export default AdminRoute