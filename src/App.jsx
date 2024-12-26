import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserRoute from './routes/user/UserRoute';

function App() {

  return (
    <>
      <Routes>
         <Route path='/user/*' element={<UserRoute/>}/>
         {/* <Route path='/admin/*' element={<AdminRoute/>}/> */}
         {/* <Route path='*' element={<UserRoute/>}/> */}
      </Routes>
      <ToastContainer />

    </>
  )
}

export default App
