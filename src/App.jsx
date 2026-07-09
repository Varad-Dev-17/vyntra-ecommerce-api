import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import CartPage from "./pages/CartPage";
import { CartProvider } from "./context/CartContext";

import SmoothScrollProvider from "./components/SmoothScrollProvider";
import SmoothScrollbar from "./components/SmoothScrollbar";

// Admin Layout & Pages
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import CatalogLayout from "./pages/admin/Catalog/CatalogLayout";
import Categories from "./pages/admin/Catalog/Categories";
import ArticleTypes from "./pages/admin/Catalog/ArticleTypes";
import Brands from "./pages/admin/Catalog/Brands";
import Attributes from "./pages/admin/Catalog/Attributes";
import AdminProducts from "./pages/admin/Products/Products";
import StockManagement from "./pages/admin/StockManagement/StockManagement";
import Orders from "./pages/admin/Orders/Orders";
import Users from "./pages/admin/Users/Users";
import Coupons from "./pages/admin/Coupons/Coupons";
import Reviews from "./pages/admin/Reviews/Reviews";

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
      {/* REMOVED pt-16 — content starts at top, navbar overlays it */}
      <main className="grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
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
            <SmoothScrollProvider>
              <SmoothScrollbar />
              <Home />
            </SmoothScrollProvider>
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
              <CartPage />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard - Route Based Architecture */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Dedicated Catalog Workspace */}
        <Route path="catalog" element={<CatalogLayout />}>
          <Route index element={<Navigate to="categories" replace />} />
          <Route path="categories" element={<Categories />} />
          <Route path="article-types" element={<ArticleTypes />} />
          <Route path="brands" element={<Brands />} />
          <Route path="attributes" element={<Attributes />} />
        </Route>

        {/* Other direct modules */}
        <Route path="products" element={<AdminProducts />} />
        <Route path="stock-management" element={<StockManagement />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
            success: {
              style: {
                background: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
              },
              iconTheme: {
                primary: "#059669",
                secondary: "#ecfdf5",
              },
            },
            error: {
              style: {
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
              },
              iconTheme: {
                primary: "#dc2626",
                secondary: "#fef2f2",
              },
            },
          }}
        />
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
