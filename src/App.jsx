import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Programs from './pages/Programs/Programs';
import Fellowship from './pages/Fellowship/Fellowship';
import Volunteer from './pages/Volunteer/Volunteer';
import Contact from './pages/Contact/Contact';
import Gallery from './pages/Gallery/Gallery';
import Reports from './pages/Reports/Reports';
import Donate from './pages/Donate/Donate';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard/EmployeeDashboard';
import ProgramDetail from './pages/ProgramDetail/ProgramDetail';

import FellowDashboard from './pages/Fellowship/FellowDashboard';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';

import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTop/ScrollToTopButton';

const Layout = ({ children }) => {
  const location = useLocation();
  // Hide Navbar/Footer for dashboard and login routes
  const hideNavFooter = ['/login', '/admin-dashboard', '/employee-dashboard', '/fellow-dashboard', '/volunteer-dashboard'].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <main id="main-content">
        {children}
      </main>
      {!hideNavFooter && <Footer />}
      <ScrollToTopButton />
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
            <Route path="/programs/:id" element={<ProgramDetail />} />
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
            <Route path="/fellow-dashboard" element={<FellowDashboard />} />
            <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
