import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useDispatch } from 'react-redux';
import { login } from "../../../redux/Slices/authSlice";

//imgaes
import loginImage from '../../../assets/user/login/banner.jpg'
import google from '../../../assets/user/signup/googleicon.png'
import logo from '../../../assets/user/signup/logo 3.png'

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const dispatch = useDispatch();
  const Navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@gmail\.com$/.test(trimmedEmail)) {
      newErrors.email = "Email must be a valid Gmail address.";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password should not be empty.";
    } else if (password.length < 6) {
      newErrors.password = "Password should contain at least 6 digits.";
    }

    return newErrors;
  };

  const googleAuth = () => {
    window.open(`http://localhost:3000/auth/google/callback`, "_self");
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/login/success", {
          withCredentials: true
        });

        if (response.data.user) {
          dispatch(login({ user: response.data.user, role: response.data.role || 'user' }));
          Navigate('/user/home');
        }
      } catch (error) {
        console.error("Login check error:", error);
      }
    };

    checkLoginStatus();
  }, [dispatch, Navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
   
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const userData = { email, password };
      const response = await axios.post("http://localhost:3000/user/login", userData, {
        headers: {
          "Content-Type": "application/json",  
        },
        withCredentials: true  // Add this to handle cookies
      });

      console.log(response.data);
      
      if (response.data.status === 'VERIFIED') {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored"
        });
  
        // Correctly structure the user data for Redux
        dispatch(login({
          user: {
            id: response.data.user.id,
            _id: response.data.user.id, // Include both formats
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            profileImage: response.data.user.profileImage,
            isAdmin: response.data.user.isAdmin
          }
        }));
  
        // Check for redirect information
        const { state } = location;
        if (state?.from && state?.productDetails) {
          Navigate(state.from, { state: { productDetails: state.productDetails } });
        } else {
          Navigate('/user/home');
        }
      }
    } catch(error) {
      toast.error(error.response?.data?.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      console.error("Error config:", error.config);
    }
  };



  return (
    <div className="flex min-h-screen">
      {/* Left side - Motorcycle Image */}
      <div className="hidden md:block w-1/2 relative bg-black">
        <img
          src={loginImage}
          alt="Motorcycle rider"
          className="h-full w-full object-cover opacity-75 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>
  
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 bg-white">
        <div className="max-w-[450px] mx-auto">
          <div className="flex justify-end mb-8">
            <img
              src={logo}
              alt="Logo"
              className="object-contain w-20 h-20"
            />
          </div>
  
          <h1 className="text-4xl font-bold mb-10">Log In</h1>
  
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 placeholder:text-gray-400"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
  
            {/* Password */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 placeholder:text-gray-400"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
  
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-md hover:bg-black/90 transition-colors duration-200 text-lg font-medium"
            >
              Log In
            </button>
  
            {/* Google Sign-In */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="w-full h-12 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 text-lg font-medium flex items-center justify-center gap-2"
                onClick={googleAuth}
              >
                <img
                  src={google}
                  alt="Google"
                  className="w-6 h-6 object-contain"
                />
                Continue with Google
              </button>
            </div>
          </form>
  
          {/* Signup Redirect */}
          <div className="text-center space-x-1 mt-6">
            <span className="text-gray-600">New user?</span>
            <Link
              to="/user/signup"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ 
            fontFamily: "serif",
            fontSize: '18px',
          }}
        />
    </div>
  );
  
}

export default Login;
