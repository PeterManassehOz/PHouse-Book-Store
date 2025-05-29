import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ChiefAdminSignup from './pages/ChiefAdminSignup/ChiefAdminSignup'
import AdminSignup from './pages/AdminSignup/AdminSignup'
import AdminLogin from './pages/AdminLogin/AdminLogin'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import EditBook from './components/EditBook/EditBook'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux'
import ForgotPHCode from './components/ForgotPHCode/ForgotPHCode'


function App() {

  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <>

      <Router>
      <ToastContainer />
      <div className={`min-h-screen transition-colors duration-300 ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
           }`}>
          <Routes>
            <Route path="/" element={<ChiefAdminSignup />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            {<Route path="/edit-book/:id" element={<EditBook />} />}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path='/forgot-phcode' element={<ForgotPHCode />} />
          </Routes>
        </div>   
      </Router>
    </>
  )
}

export default App
