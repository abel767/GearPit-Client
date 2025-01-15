import AddProductOffer from "../../../../components/Admin/Offer/AddProductOffer";
import Header from "../../../../components/Admin/Dashboard/Header";
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar";

function AddProductOfferPage(){
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <AddProductOffer />
          </div>
        </div>
      )
}

export default AddProductOfferPage