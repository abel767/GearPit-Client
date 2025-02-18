import AddCategoryOffer from "../../../../components/Admin/Offer/AddCategoryOffer";
// import Header from "../../../../components/Admin/Dashboard/Header";
import Sidebar from "../../../../components/Admin/Dashboard/Sidebar";

function AddCategoryOfferPage(){
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1">
            {/* <Header /> */}
            <AddCategoryOffer />
          </div>
        </div>
      )
}

export default AddCategoryOfferPage