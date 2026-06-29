import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TrendingProducts from "./components/TrendingProducts";
import AdminSignInPage from "./pages/AdminSignInPage";
import PageNotFound from "./components/PageNotFound";
import AdminDashBoard from "./pages/AdminDashBoard";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Products from "./pages/ProductsPage";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf8ff]">
        <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;

  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf8ff]">
        <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/home" replace />;
};

// ============================================
// USER LAYOUT
// ============================================
const UserLayout = ({ children }) => {
  const location = useLocation();
  const hideFooterPaths = ["/signin", "/signup", "/admin/signin"];
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="pt-16 grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

// ============================================
// ADMIN LAYOUT
// ============================================
const AdminLayout = ({ children }) => {
  return <div className="min-h-screen bg-[#f8f7fc]">{children}</div>;
};

// ============================================
// ROUTES CONFIGURATION
// ============================================
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin/signin" element={<AdminSignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* User Routes with Navbar + Footer */}
      <Route
        path="/home"
        element={
          <UserLayout>
            <Home />
          </UserLayout>
        }
      />
      <Route
        path="/trending"
        element={
          <ProtectedRoute>
            <UserLayout>
              <TrendingProducts />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <UserLayout>
              <ChangePasswordPage />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <UserLayout>
            <Products />
          </UserLayout>
        }
      />
      {/* <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <UserLayout>
              <div className="pt-20 p-8 text-center">
                Collections Page Coming Soon
              </div>
            </UserLayout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/new-arrivals"
        element={
          <ProtectedRoute>
            <UserLayout>
              <div className="pt-20 p-8 text-center">
                New Arrivals Page Coming Soon
              </div>
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <UserLayout>
              <div className="pt-20 p-8 text-center">Cart Page Coming Soon</div>
            </UserLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard - NO user Navbar, admin has its own header */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminDashBoard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
