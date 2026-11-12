// Route inventory for Fayidh. Each member's pages live in their own folder:
//   m1-auth      – sign up, log in, verification, profiles, My Requests
//   m2-browse    – home, browse, listing details, admin listing moderation
//   m3-listings  – seller listings (create, view, edit, remove)
//   m4-requests  – purchase / donation requests, seller incoming requests
//   m5-admin     – admin login, dashboard, users, categories

import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout, RequireRole } from './components/Layout.jsx';
import { EmptyState } from './components/ui.jsx';

// M1
import Login from './pages/m1-auth/Login.jsx';
import SignUp from './pages/m1-auth/SignUp.jsx';
import CheckEmail from './pages/m1-auth/CheckEmail.jsx';
import ActivateAccount from './pages/m1-auth/ActivateAccount.jsx';
import VerifyStudent from './pages/m1-auth/VerifyStudent.jsx';
import ForgotPassword from './pages/m1-auth/ForgotPassword.jsx';
import Profile from './pages/m1-auth/Profile.jsx';
import MyRequests from './pages/m1-auth/MyRequests.jsx';
import OrganizationDashboard from './pages/m1-auth/OrganizationDashboard.jsx';

const ORG = ['organization'];
const BUYERS = ['organization', 'student'];

function NotFound({ forbidden = false }) {
  return (
    <div className="container page">
      <EmptyState
        icon={forbidden ? '!' : '?'}
        title={forbidden ? 'You do not have access to this page' : 'Page not found'}
        message={forbidden ? 'This page is not available for your account type.' : 'The page you are looking for does not exist.'}
        action={
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        }
      />
    </div>
  );
}

const guard = (roles, el) => <RequireRole roles={roles}>{el}</RequireRole>;

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* M1 – accounts */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/activate/:userId" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-student" element={guard(['student'], <VerifyStudent />)} />
        <Route path="/profile" element={guard(BUYERS, <Profile />)} />
        <Route path="/my-requests" element={guard(BUYERS, <MyRequests />)} />
        <Route path="/dashboard" element={guard(ORG, <OrganizationDashboard />)} />

        <Route path="/forbidden" element={<NotFound forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
