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
import Cart from '../../pages/user/Cart/Cart';
import OrderDetailAndTrack from '../../pages/user/OrderDetails/OrderDetailAndTrack';
import WalletPage from '../../pages/user/Wallet/WalletPage';
import WhishlistPage from '../../pages/user/whishlist/WhislistPage';
import PaymentFailurePage from '../../pages/user/Checkout/PaymentFailurePage';
import ContactUsPage from '../../pages/user/contact/ContactUsPage';
import AboutUsPage from '../../pages/user/AboutUsPage/AboutUsPage';
import GoogleCallback from '../../services/GoogleCallBack';
function UserRoute() {
  return (
    <Routes>

      <Route element={<LoginProtect/>}>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/verify-otp/:userId/:email' element={<VerifyOTP/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/auth/google/callback' element={<GoogleCallback/>}/>
      </Route>

      <Route element={<ProtectedRoute/>}>
        <Route path="/home" element={<BlockedUserWrapper><Home/></BlockedUserWrapper>} />
        <Route path="/Profile" element={<BlockedUserWrapper><UserProfile/></BlockedUserWrapper>} />
        <Route path="/address" element={<BlockedUserWrapper><AddressPage/></BlockedUserWrapper>} />
        <Route path="/store" element={<BlockedUserWrapper><StorePage/></BlockedUserWrapper>} />
        <Route path="/product/:id" element={<BlockedUserWrapper><ProductDetailPage/></BlockedUserWrapper>} />
        <Route path="/Checkout" element={<BlockedUserWrapper><CheckOut/></BlockedUserWrapper>} />
        <Route path="/PaymentSuccess" element={<BlockedUserWrapper><PaymentDone/></BlockedUserWrapper>} />
        <Route path="/PaymentFailure" element={<BlockedUserWrapper><PaymentFailurePage/></BlockedUserWrapper>} />
        <Route path="/OrderHistory" element={<BlockedUserWrapper><OrderHistory/></BlockedUserWrapper>} />
        <Route path="/cart" element={<BlockedUserWrapper><Cart/></BlockedUserWrapper>} />
        <Route path="/OrderDetail" element={<BlockedUserWrapper><OrderDetailAndTrack/></BlockedUserWrapper>} />
        <Route path="/wallet" element={<BlockedUserWrapper><WalletPage/></BlockedUserWrapper>} />
        <Route path="/wishlist" element={<BlockedUserWrapper><WhishlistPage/></BlockedUserWrapper>} />
        <Route path="/contact" element={<BlockedUserWrapper><ContactUsPage/></BlockedUserWrapper>} />
        <Route path="/aboutus" element={<BlockedUserWrapper><AboutUsPage/></BlockedUserWrapper>} />
      </Route>
    </Routes>
  )
  }

export default UserRoute


