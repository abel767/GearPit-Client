import InventoryManagement from "../../../components/Admin/Inventory/InventoryManagement";
import Header from "../../../components/Admin/Dashboard/Header";
import Sidebar from "../../../components/Admin/Dashboard/Sidebar";

function Inventory(){
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <InventoryManagement />
          </div>
        </div>
      )
}

export default Inventory