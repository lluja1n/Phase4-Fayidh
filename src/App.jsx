import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/Layout.jsx';

//M2 - Home and Browse
import Home from './pages/m2-browse/Home.jsx';
import BrowseListings from './pages/m2-browse/BrowseListings.jsx';
import ListingDetails from './pages/m2-browse/ListingDetails.jsx';

//M5 - Admin
import AdminLogin from './pages/m5-admin/AdminLogin.jsx';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseListings />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </AppLayout>
  );
}
