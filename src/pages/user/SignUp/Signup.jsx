import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { User } from 'lucide-react';


// images 
import bann from '../../../assets/user/signup/Moto.jpeg'
import google from '../../../assets/user/signup/googleicon.png'
import logo from '../../../assets/user/signup/logo 3.png'
function Signup() {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null); // Updated for file
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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
    window.open(`http://localhost:3000/auth/google/callback`, "_self");
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

      // Upload to Cloudinary
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

      const response = await axios.post(`http://localhost:3000/user/signup`, userData, {
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

  return (
    <div className="flex min-h-screen">
      {/* Left side - Motorcycle Image */}
      <div className="hidden md:block w-1/2 relative ">
        <img
          src={bann}
          alt="Motorcycle rider"
          className="h-full w-full object-fit  mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>
  
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 bg-white">
        <div className="max-w-[450px] mx-auto">
          <div className="flex justify-end mb-8">
            <img src={logo} alt="Logo" className="object-contain w-20 h-20" />
          </div>
  
          <h1 className="text-4xl font-bold mb-10">Create Account</h1>
  
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full h-14 px-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                {errors.firstname && (
                  <p className="text-red-500 text-sm">{errors.firstname}</p>
                )}
              </div>
  
              <div className="relative">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full h-14 px-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                {errors.lastname && (
                  <p className="text-red-500 text-sm">{errors.lastname}</p>
                )}
              </div>
            </div>
  
            {/* Username */}
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 px-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>
  
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
  
            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
  
            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmpassword}
              onChange={(e) => setConfirmpassword(e.target.value)}
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
            />
            {errors.confirmpassword && (
              <p className="text-red-500 text-sm">{errors.confirmpassword}</p>
            )}
  
            {/* Phone Number */}
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ease-in-out placeholder:text-gray-400"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
  
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
  
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-14 bg-black text-white rounded-lg hover:bg-black/90 transition-colors duration-200 ease-in-out text-lg font-semibold"
            >
              Create
            </button>
  
            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <span className="relative bg-white px-4 text-sm text-gray-500">OR</span>
            </div>
  
            <button
              type="button"
              className="w-full h-14 flex items-center justify-center gap-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 ease-in-out text-lg font-semibold"
              onClick={googleAuth}
            >
              <img
                src={google}
                alt="Google"
                className="w-6 h-6 object-contain"
              />
              Continue with Google
            </button>
  
            <div className="text-center space-x-1">
              <span className="text-gray-600">Already have an account?</span>
              <Link
                to="/user/login"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Login Now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
}

export default Signup;
