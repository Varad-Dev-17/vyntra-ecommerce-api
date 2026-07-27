import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/home/Home";
import SignIn from "./pages/user/SignIn";
import SignUp from "./pages/user/SignUp";
import AdminSignInPage from "./pages/admin/auth/AdminSignInPage";
import PageNotFound from "./components/common/PageNotFound";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
import Products from "./pages/shop-now/ProductsPage";
import ProductDetailsPage from "./pages/product-details/ProductDetailsPage";
import Bag from "./pages/bag/Bag";
import Address from "./pages/checkout/Address";
import Payment from "./pages/checkout/Payment";
import WishlistPage from "./pages/wishlist/WishlistPage";
import MyAccount from "./pages/account/MyAccount";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import SmoothScrollProvider from "./animation/globalanimation/scroll/SmoothScrollProvider";
import SmoothScrollbar from "./animation/globalanimation/scroll/SmoothScrollbar";

// Admin Layout & Pages
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import CatalogLayout from "./pages/admin/Catalog/CatalogLayout";
import DepartmentsList from "./pages/admin/Catalog/DepartmentsModule/DepartmentsList";
import AddDepartment from "./pages/admin/Catalog/DepartmentsModule/AddDepartment";
import EditDepartment from "./pages/admin/Catalog/DepartmentsModule/EditDepartment";
import CategoriesList from "./pages/admin/Catalog/CategoriesModule/CategoriesList";
import AddCategory from "./pages/admin/Catalog/CategoriesModule/AddCategory";
import EditCategory from "./pages/admin/Catalog/CategoriesModule/EditCategory";

import BrandsList from "./pages/admin/Catalog/BrandsModule/BrandsList";
import AddBrand from "./pages/admin/Catalog/BrandsModule/AddBrand";
import EditBrand from "./pages/admin/Catalog/BrandsModule/EditBrand";
import AttributesList from "./pages/admin/Catalog/AttributesModule/AttributesList";
import AddAttribute from "./pages/admin/Catalog/AttributesModule/AddAttribute";
import EditAttribute from "./pages/admin/Catalog/AttributesModule/EditAttribute";
import ProductsList from "./pages/admin/Catalog/ProductsModule/ProductsList";
import AddProduct from "./pages/admin/Catalog/ProductsModule/AddProduct";
import EditProduct from "./pages/admin/Catalog/ProductsModule/EditProduct";
import ProductVariants from "./pages/admin/Catalog/ProductsModule/ProductVariants";

import StockManagement from "./pages/admin/StockManagement/StockManagement";
import Orders from "./pages/admin/Orders/Orders";
import Users from "./pages/admin/Users/Users";
import Coupons from "./pages/admin/Coupons/Coupons";
import Reviews from "./pages/admin/Reviews/Reviews";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf8ff]">
        <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;

  return children;
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
      <Route
        path="/"
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
        path="/home"
        element={<Navigate to="/" replace />}
      />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin/signin" element={<AdminSignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
        path="/product/:slug"
        element={
          <UserLayout>
            <ProductDetailsPage />
          </UserLayout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <UserLayout>
              <WishlistPage />
            </UserLayout>
          </ProtectedRoute>
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
        path="/bag"
        element={
          <ProtectedRoute>
            <UserLayout>
              <Bag />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout/address"
        element={
          <ProtectedRoute>
            <UserLayout>
              <Address />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout/payment"
        element={
          <ProtectedRoute>
            <UserLayout>
              <Payment />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <UserLayout>
              <MyAccount />
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
          <Route index element={<Navigate to="departments" replace />} />
          <Route path="departments">
            <Route index element={<DepartmentsList />} />
            <Route path="add" element={<AddDepartment />} />
            <Route path=":id/edit" element={<EditDepartment />} />
          </Route>
          <Route path="categories">
            <Route index element={<CategoriesList />} />
            <Route path="add" element={<AddCategory />} />
            <Route path=":id/edit" element={<EditCategory />} />

          </Route>
          <Route path="brands">
            <Route index element={<BrandsList />} />
            <Route path="add" element={<AddBrand />} />
            <Route path=":id/edit" element={<EditBrand />} />
          </Route>
          <Route path="attributes">
            <Route index element={<AttributesList />} />
            <Route path="add" element={<AddAttribute />} />
            <Route path=":id/edit" element={<EditAttribute />} />
          </Route>

        </Route>

        {/* Products Module */}
        <Route path="products">
          <Route index element={<ProductsList />} />
          <Route path="add" element={<AddProduct />} />
          <Route path=":id/edit" element={<EditProduct />} />
          <Route path=":id/variants" element={<ProductVariants />} />
        </Route>

        {/* Other direct modules */}
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
              icon: null,
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
              icon: null,
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
        <WishlistProvider>
          <Router>
            <AppRoutes />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
