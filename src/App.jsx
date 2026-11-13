import { Route, Routes } from 'react-router-dom';
import { AppLayout, RequireRole } from './components/Layout.jsx';

//M2 - Home and Browse
import Home from './pages/m2-browse/Home.jsx';
import BrowseListings from './pages/m2-browse/BrowseListings.jsx';
import ListingDetails from './pages/m2-browse/ListingDetails.jsx';

//M5 - Admin
import AdminLogin from './pages/m5-admin/AdminLogin.jsx';
import AdminDashboard from './pages/m5-admin/AdminDashboard.jsx';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseListings />} />
        <Route path="/listings/:id" element={<ListingDetails />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireRole roles={['admin']}>
              <AdminDashboard />
            </RequireRole>
          }
        />
      </Routes>
    </AppLayout>
  );
}
