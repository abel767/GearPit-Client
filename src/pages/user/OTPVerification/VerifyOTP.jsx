import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { userLogin } from "../../../redux/Slices/userSlice";

export default function VerifyOTP() {
  const { userId, email } = useParams();
  const dispatch = useDispatch();
  const Navigate = useNavigate();

  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [timer, setTimer] = useState(30);
  const [resendVisible, setResendVisible] = useState(false);

  if (!userId) {
    console.error("UserId not passed to VerifyOTP page");
    return null;
  }

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendVisible(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  function handleChange(e, index) {
    if (isNaN(e.target.value)) return;

    const newOtp = otp.map((data, indx) =>
      indx === index ? e.target.value : data
    );
    setOtp(newOtp);

    // Move to next input if value is entered
    if (e.target.value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  }

  async function handleVerify() {
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      // Log userId and otp to verify they're being sent correctly
      console.log("Verifying OTP for userId:", userId, "with OTP:", otpValue);

      const response = await axios.post(
        "http://localhost:3000/user/verifyOTP",
        {
          userId,
          otp: otpValue,
        },
        {
          withCredentials: true
        }
      );

      console.log('Backend response:', response.data);  // Log the backend response for debugging

      if (response.data.status === "VERIFIED") {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Dispatch login action
        dispatch(userLogin({ user: userId }));

        // Redirect to home after 2 seconds delay
        Navigate('/user/login');


      } else {
        alert(response.data.message || "OTP verification failed");
      }
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
  }

  async function handleResend() {
    try {
      setOtp(new Array(4).fill(""));
      setTimer(30);
      setResendVisible(false);

      const response = await axios.post("http://localhost:3000/user/resendOTP", {
        userId,
        email
      });

      toast.success("A new OTP has been sent to your email/phone.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

    } catch (error) {
      console.error("Error during OTP resend:", error);
      toast.error("An error occurred while resending OTP. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Please Verify Account
            </h2>
            <p className="text-sm text-gray-600">
              Enter the four-digit code we sent to your email address to verify
              your new GearPit Account.
            </p>
          </div>

          <div className="flex justify-center space-x-2 mt-6">
            {otp.map((data, index) => (
              <input
                key={index}
                ref={(el) => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 border-2 rounded bg-gray-50 text-center text-xl font-semibold text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            ))}
          </div>

          <div className="text-center text-sm">
            <button
              className={`text-gray-600 ${!resendVisible ? "cursor-not-allowed" : "cursor-pointer"} `}
              disabled={!resendVisible}
              onClick={handleResend}
            >
              Resend OTP in {formatTime(timer)}
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleVerify}
              className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg"
            >
              Verify OTP
            </button>
          </div>

        </div>
      </div>
      <ToastContainer />
    </>
  );
}
