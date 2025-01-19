import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '../../../services/authService';
import image from '../../../assets/admin/helmet 2.jpg'
import logo from '../../../assets/user/signup/logo 3.png'
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setErrors] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Email is required.';
    } else if (!/^[\w-.]+@(gmail\.com|admin\.com)$/.test(trimmedEmail)) {
      newErrors.email = 'Use an authorized admin email.';
    }

    if (!trimmedPassword) {
      newErrors.password = 'Password is required.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validateErrors = validateForm();
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    try {
      const response = await loginAdmin({ email, password });

      toast.success(response.message, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });

      setTimeout(() => {
        Navigate('/admin/dashboard');
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Motorcycle Image */}
      <div className="hidden md:block w-1/2 relative bg-black">
        <img
          src={image} // Replace with your image path
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
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 placeholder:text-gray-400"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full h-12 bg-black text-white rounded-md hover:bg-black/90 transition-colors duration-200 text-lg font-medium"
            >
              Log In
            </button>
          </form>
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
          fontFamily: 'serif',
          fontSize: '18px',
        }}
      />
    </div>
  );
}

export default AdminLogin;
