import Dashboard from "../../../components/Admin/Dashboard/Dashboard";
import Header from "../../../components/Admin/Dashboard/Header";
import Sidebar from "../../../components/Admin/Dashboard/Sidebar";

function AdminDashboard(){
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <Dashboard />
          </div>
        </div>
      )
}

export default AdminDashboard