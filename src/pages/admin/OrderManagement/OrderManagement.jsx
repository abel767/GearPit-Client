import OrderList from "../../../components/Admin/OrderManagement/OrderList";
import Header from "../../../components/Admin/Dashboard/Header";
import Sidebar from "../../../components/Admin/Dashboard/Sidebar";

function OrderManagement(){
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <OrderList />
          </div>
        </div>
      )
}

export default OrderManagement