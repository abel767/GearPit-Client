import { useEffect, useState } from "react";
import Footer from '../../../components/Footer/Fotoer';
import Navbar from "../../../components/navbar/Navbar";
import axios from "axios";
import { useSelector } from "react-redux";
import Hero from '../../../components/userHome/Hero';
import Featured from '../../../components/userHome/Featured';
import BannerCarousel from '../../../components/userHome/Banner';

function Home() {
  // Get user data from the user slice instead of auth slice
  const userState = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userState.isAuthenticated || !userState.user) {
        setLoading(false);
        return;
      }

      try {
        const userId = userState.user._id || userState.user.id;
        const response = await axios.get(
          `http://localhost:3000/user/getuserdata/${userId}`
        );
        setUserData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userState.isAuthenticated, userState.user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userState.isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-9"> {/* pt-16 accounts for the navbar height */}
      <Hero />
      <Featured />
      <BannerCarousel />    
      </main>
      <Footer />
    </>
  );
}

export default Home;