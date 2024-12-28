import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserRoute from './routes/user/UserRoute';
import AdminRoute from './routes/admin/AdminRoute';
function App() {

  return (
    <>
      <Routes>
         <Route path='/user/*' element={<UserRoute/>}/>
         <Route path='/admin/*' element={<AdminRoute/>}/>
         {/* <Route path='*' element={<UserRoute/>}/> */}
      </Routes>
      <ToastContainer />

    </>
  )
}

export default App
