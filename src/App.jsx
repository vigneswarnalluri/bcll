import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Fellowship from './pages/Fellowship';
import Volunteer from './pages/Volunteer';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Reports from './pages/Reports';
import Donate from './pages/Donate';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

import ScrollToTop from './components/ScrollToTop';

const Layout = ({ children }) => {
  const location = useLocation();
  // Hide Navbar/Footer for dashboard and login routes
  const hideNavFooter = ['/login', '/admin-dashboard', '/employee-dashboard'].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/fellowship" element={<Fellowship />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />

            {/* Admin & Employee System Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
