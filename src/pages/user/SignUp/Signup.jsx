import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';
import axios from "axios";
import axiosInstance from "../../../api/axiosInstance";
import image from '../../../assets/user/login/test.png'

function Signup() {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmpassword, setConfirmpassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Rest of the existing functions remain the same
  const validateForm = () => {
    const newErrors = {};
    const trimmedFirstname = firstName.trim();
    const trimmedLastname = lastName.trim();
    const trimmedUsername = userName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmpassword = confirmpassword.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstname) {
      newErrors.firstname = "FirstName is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedFirstname)) {
      newErrors.firstname = "FirstName can only contain letters"
    }

    if (!trimmedLastname) {
      newErrors.lastname = "LastName is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedLastname)) {
      newErrors.lastname = "LastName can only contain letters"
    }

    if (!trimmedUsername) {
      newErrors.username = "UserName is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedUsername)) {
      newErrors.username = "Username can only contain letters"
    }

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@gmail\.com$/.test(trimmedEmail)) {
      newErrors.email = "Email must be a valid Gmail address.";
    }

    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(trimmedPhone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password should not be empty."
    } else if (password.length < 6) {
      newErrors.password = "Password should contain at least 6 characters"
    }

    if (trimmedConfirmpassword !== password) {
      newErrors.confirmpassword = "Passwords do not match"
    }

    return newErrors;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const googleAuth = () => {
    try {
      const backendUrl = 'http://localhost:3000';
      console.log('Starting Google Auth, redirecting to:', `${backendUrl}/auth/google`);
      window.location.href = `${backendUrl}/auth/google`;
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!profileImage) {
      toast.error("Please upload a profile image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", profileImage);
      formData.append("upload_preset", "GearPit");

      const cloudinaryResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/dxdsvdd7l/image/upload",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: false 
        }
      );
      const profileImageUrl = cloudinaryResponse.data.secure_url;

      const userData = {
        firstName,
        lastName,
        userName,
        email,
        phone,
        password,
        profileImage: profileImageUrl
      };

      const response = await axiosInstance.post('/user/signup', userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const userId = response.data.userId;
      const responseEmail = response.data.email;
      setTimeout(() => {
        navigate(`/user/verify-otp/${userId}/${responseEmail}`);
      }, 2000);
    } catch (error) {
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

  // In your signup component, add a test function
const testBackendConnection = async () => {
  try {
    const response = await axios.get('https://51.20.143.235.nip.io/test-cors');
    console.log('Direct connection result:', response.data);
  } catch (error) {
    console.error('Direct connection error:', error);
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
        <h4 className="text-2xl md:text-2xl font-black mb-8 md:mb-12 tracking-tight text-center mt-10">
          Join the Adventure: Sign Up Now!
        </h4>

        <form className="w-full max-w-md space-y-4 md:space-y-6 px-4 md:px-0" onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {errors.firstname && (
                <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {errors.lastname && (
                <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

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

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmpassword}
              onChange={(e) => setConfirmpassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {errors.confirmpassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmpassword}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 hover:file:bg-gray-200"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-black text-white rounded-md hover:bg-black/90 transition-colors"
          >
            Create Account
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

        <div className="mt-6 md:mt-8 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/user/login" className="text-red-600 hover:text-red-700 font-medium">
            Login now
          </Link>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-full md:w-1/4 relative min-h-[200px] md:min-h-0 mt-8 md:mt-0">
        <img
          src={image}
          alt="Motorcycle"
          className="absolute bottom-0 right-0 w-full max-w-md object-contain md:object-cover h-full"
        />
      </div>
    </div>
  );
}

export default Signup;