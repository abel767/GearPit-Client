import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginUser } from "../../../services/authService";
import { Eye, EyeOff } from 'lucide-react';
import image from '../../../assets/user/login/test.png'
import TestCORS from "../../../components/testCors";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

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
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      console.log('Starting Google Auth, redirecting to:', `${backendUrl}/auth/google`);
      window.location.href = `${backendUrl}/auth/google`;
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
   
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const response = await loginUser({ email, password });
      console.log('Login response:', response);
      
      if (response.status === 'VERIFIED' && response.user) {
        toast.success(response.message || 'Login successful', {
          position: "top-right",
          autoClose: 2000,
          theme: "colored"
        });
  
        setTimeout(() => {
          navigate('/user/home', { replace: true });
        }, 2000);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch(error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left side - Logo */}
      <div className="w-full md:w-1/4 p-4 md:p-8 flex items-center md:items-start">
        <div className="text-4xl md:text-6xl font-black tracking-tighter"></div>
      </div>

      {/* Center - Form */}
      <div className="w-full md:w-1/2 px-4 md:px-0 flex flex-col justify-center items-center">
        <h1 className="text-4xl md:text-5xl font-black mb-8 md:mb-12 tracking-tight text-center">
          Welcome Back
        </h1>
        
        <form className="w-full max-w-md space-y-4 md:space-y-6 px-4 md:px-0" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-black text-white rounded-md hover:bg-black/90 transition-colors"
          >
            Login
          </button>

          <div className="relative py-2 md:py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={googleAuth}
            className="w-full h-12 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center px-4 md:px-0">
          <span className="text-gray-600">Dont have an account? </span>
          <Link to="/user/signup" className="text-red-600 hover:text-red-700 font-medium">
            Sign up now
          </Link>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-full md:w-1/4 relative min-h-[200px] md:min-h-full mt-8 md:mt-0">
        <img
          src={image}
          alt="Glove"
          className="absolute bottom-0 right-0 w-full max-w-md object-contain md:object-cover h-full"
        />
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
      {/* Add TestCORS component */}
<div className="mt-6 px-4">
  <h3 className="text-lg font-medium mb-2">API Connection Test</h3>
  <TestCORS />
</div>
    </div>
  );
}

export default Login;