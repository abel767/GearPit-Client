import SalesReport from "../../../../components/Admin/salesReport/SalesReport";
import Header from "../../../../components/Admin/Dashboard/Header";
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar";

function SalesReportPage(){
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <SalesReport />
          </div>
        </div>
      )
}

export default SalesReportPage