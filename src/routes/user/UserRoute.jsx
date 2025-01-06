import { Route, Routes } from 'react-router-dom';
import Signup from "../../pages/user/SignUp/Signup";
import VerifyOTP from "../../pages/user/OTPVerification/VerifyOTP";
import Login from "../../pages/user/Login/Login";
import Home from "../../pages/user/Home/Home";
import UserProfile from '../../pages/user/UserProfile/UserProfile';
import AddressPage from '../../pages/user/Address/AddressPage';
import StorePage from '../../pages/user/store/StorePage';
import ProductDetailPage from '../../pages/user/ProductDetail/ProductDetailPage';
import CheckOut from '../../pages/user/Checkout/CheckOut';
import PaymentDone from '../../pages/user/Checkout/PaymentDone';
import OrderHistory from '../../pages/user/UserOrderManagement/OrderHistory';
import { ProtectedRoute,LoginProtect }  from '../../protect/ProtectedRoute';
import BlockedUserWrapper from '../../components/BlockUser/BlockUserWrapper';
function UserRoute() {
  return (
    <Routes>
      <Route element={<LoginProtect/>}>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/verify-otp/:userId/:email' element={<VerifyOTP/>}/>
        <Route path='/login' element={<Login/>}/>
      </Route>

      <Route element={<ProtectedRoute/>}>
        <Route path="/home" element={<BlockedUserWrapper><Home/></BlockedUserWrapper>} />
        <Route path="/Profile" element={<BlockedUserWrapper><UserProfile/></BlockedUserWrapper>} />
        <Route path="/address" element={<BlockedUserWrapper><AddressPage/></BlockedUserWrapper>} />
        <Route path="/store" element={<BlockedUserWrapper><StorePage/></BlockedUserWrapper>} />
        <Route path="/product/:id" element={<BlockedUserWrapper><ProductDetailPage/></BlockedUserWrapper>} />
        <Route path="/Checkout" element={<BlockedUserWrapper><CheckOut/></BlockedUserWrapper>} />
        <Route path="/PaymentSuccess" element={<BlockedUserWrapper><PaymentDone/></BlockedUserWrapper>} />
        <Route path="/OrderHistory" element={<BlockedUserWrapper><OrderHistory/></BlockedUserWrapper>} />
      </Route>
    </Routes>
  )
  }

export default UserRoute


