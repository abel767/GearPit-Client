import Navbar from '../../../components/navbar/Navbar'
// import Footer from '../../../components/Footer/Fotoer'
import ContactPage from '../../../components/contactUs/ContactPage'
export default function ContactUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <ContactPage />
      </main>
      {/* <Footer /> */}
    </div>
  )
}