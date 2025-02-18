// import Header from "../../../components/Admin/Dashboard/Header"
import Sidebar from "../../../components/Admin/Dashboard/Sidebar"
import CustomersTable from "../../../components/Admin/customers/CustomersTable"
function CustomersList() {
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            {/* <Header /> */}
            <CustomersTable />
          </div>
        </div>
    )
}

export default CustomersList