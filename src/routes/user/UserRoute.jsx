import { Route, Routes } from 'react-router-dom';
import Signup from "../../pages/user/SignUp/Signup";
import VerifyOTP from "../../pages/user/OTPVerification/VerifyOTP";
import Login from "../../pages/user/Login/Login";
import Home from "../../pages/user/Home/Home";
import UserProfile from '../../pages/user/UserProfile/UserProfile';
import AddressPage from '../../pages/user/Address/AddressPage';
import { ProtectedRoute,LoginProtect }  from '../../protect/ProtectedRoute';

function UserRoute(){
    return(
        <Routes>
            <Route element={<LoginProtect/>}>
            <Route path='/signup' element={<Signup/>}/>
            <Route path='/verify-otp/:userId/:email' element={<VerifyOTP/>}/>
            <Route path='/login' element={<Login/>}/>
        </Route>

        <Route element={<ProtectedRoute/>}>
        <Route path="/home" element={<Home/>} />
        <Route path="/Profile" element={<UserProfile/>} />
        <Route path="/address" element={<AddressPage/>} />
        
      </Route>
    </Routes>
    )
}

export default UserRoute


