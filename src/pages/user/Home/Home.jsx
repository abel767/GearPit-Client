import { useEffect, useState } from "react";
import Footer from '../../../components/Footer/Fotoer'
import Navbar from "../../../components/navbar/Navbar";
import axios from "axios";
import {  useSelector } from "react-redux";
// components 
import Hero from '../../../components/userHome/Hero'
import Featured from '../../../components/userHome/Featured'
import Banner from '../../../components/userHome/Banner'
// import Brands from '../../../components/userHome/Brands'

//images
function Home() {
  const userdetail = useSelector((state) => state.auth.user);
  const [user, setUser] = useState();



  useEffect(() => {
    fetchUser();
  }, [userdetail.id]);  // Ensure the effect runs only when userdetail.id changes

 
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/user/getuserdata/${userdetail.id}`
      );
      const fetchedUser = response.data;
      setUser(fetchedUser);
    } catch (err) {
      console.error("Error fetching user:", err);
    }


  };

  return (
    <>
    <Navbar />
    <Hero/>
    <Featured/>
    {/* <Brands/> */}
    <Banner/>      
    <Footer />
    </>
  );
}

export default Home
