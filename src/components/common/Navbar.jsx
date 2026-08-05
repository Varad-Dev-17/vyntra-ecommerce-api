import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  User,
  Heart,
  ShoppingBag,
  Search,
  Menu,
  X,
  LogOut,
  Lock,
  LayoutDashboard,
  Users,
  Package,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const wishlistCount = wishlistItems?.length || 0;
  const isAdmin = user?.isAdmin;
  const isHomePage = location.pathname === "/home" || location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      // If we are on the homepage, transition navbar after scrolling 50px
      if (isHomePage) {
        setIsScrolled(window.scrollY > 50);
      } else {
        setIsScrolled(true); // Always solid on other pages
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/signin");
  };

  const userNavLinks = [
    { name: "SHOP NOW", path: "/products" }
  ];

  const adminNavLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  // Determine styles based on scroll and page
  const navBg = isScrolled ? "bg-white" : "bg-transparent";
  const navBorder = isScrolled ? "border-b border-[#E5E7EB]" : "border-transparent";
  const textColor = isScrolled ? "text-[#111827]" : "text-white";
  const searchBg = isScrolled ? "bg-gray-100/80" : "bg-white/10";
  const searchBorder = isScrolled ? "border-transparent" : "border-white/20";
  const searchPlaceholder = isScrolled ? "placeholder:text-gray-500" : "placeholder:text-gray-200";
  const searchIconColor = isScrolled ? "text-gray-500" : "text-white";

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Navbar */}
      <nav className={`${navBg} ${navBorder} transition-all duration-300`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[76px]">

            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={isAdmin ? "/admin/dashboard" : "/home"}
                className="flex items-center"
              >
                <img
                  src="/Logo/logo.png"
                  alt="Vyntra Logo"
                  className="h-10 sm:h-14 w-auto transition-all duration-300"
                  style={{ filter: isScrolled ? "none" : "drop-shadow(0px 0px 4px rgba(255,255,255,1)) drop-shadow(0px 0px 10px rgba(255,255,255,0.8))" }}
                />
              </Link>
            </div>

            {/* Center: Nav Links */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-10">
              {isAdmin
                ? adminNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 font-bold tracking-wide transition-colors hover:text-[#4F46E5]`}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: isActive(link.path) ? "#4F46E5" : (isScrolled ? "#111827" : "white"),
                    }}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))
                : userNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => {
                      if (link.name === "SHOP NOW" && !user) {
                        e.preventDefault();
                        navigate("/signin", { state: { from: { pathname: link.path } } });
                      }
                    }}
                    className={`font-bold tracking-wide transition-colors hover:text-[#4F46E5]`}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: isActive(link.path) ? "#4F46E5" : (isScrolled ? "#111827" : "white"),
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>

            {/* Right: Search Bar & Icons */}
            <div className="flex items-center justify-end gap-4 sm:gap-6 flex-shrink-0">
              {/* Search Bar (Desktop) */}
              {!isAdmin && (
                <div className="hidden lg:block relative w-[280px] group">
                  <Search
                    className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${searchIconColor} group-focus-within:text-[#4F46E5] transition-colors`}
                  />
                  <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    className={`w-full pl-11 pr-4 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] border ${searchBg} ${searchBorder} ${textColor} ${searchPlaceholder} transition-all duration-300 backdrop-blur-sm`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
              )}

              {/* Icons */}
              <div className="flex items-center gap-3 sm:gap-6">
                {!isAdmin && (
                  <>
                    <Link
                      to="/wishlist"
                      className={`relative flex flex-col items-center justify-center gap-1 ${textColor} transition-all duration-300 px-3 py-1.5 rounded-lg ${isScrolled ? "hover:bg-gray-100 hover:text-[#4F46E5]" : "hover:text-white/80"
                        }`}
                    >
                      <div className="relative">
                        <Heart size={20} strokeWidth={1.5} />
                        <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#4F46E5] text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                          {wishlistCount > 99 ? "99" : wishlistCount}
                        </span>
                      </div>
                      <span className="text-xs font-semibold hidden md:block">Wishlist</span>
                    </Link>

                    <Link
                      to="/bag"
                      className={`relative flex flex-col items-center justify-center gap-1 ${textColor} transition-all duration-300 px-3 py-1.5 rounded-lg ${isScrolled ? "hover:bg-gray-100 hover:text-[#4F46E5]" : "hover:text-white/80"
                        }`}
                    >
                      <div className="relative">
                        <ShoppingBag size={20} strokeWidth={1.5} />
                        <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#4F46E5] text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                          {cartCount > 99 ? "99" : cartCount}
                        </span>
                      </div>
                      <span className="text-xs font-semibold hidden md:block">Bag</span>
                    </Link>
                  </>
                )}

                {/* Profile / Auth Section */}
                {user ? (
                  <Link
                    to="/account"
                    className={`flex items-center gap-2 ${textColor} transition-all duration-300 pl-2 pr-3 py-1.5 rounded-full ${
                      isScrolled ? "hover:bg-gray-100 hover:text-[#4F46E5]" : "hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
                      {user?.profileImage?.url ? (
                        <img src={user.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[14px] font-bold">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold hidden md:block">
                      {user.username || "User"}
                    </span>
                  </Link>
                ) : (
                  <>
                    {/* Desktop Login Button */}
                    <Link
                      to="/signin"
                      className={`hidden md:flex items-center justify-center px-6 py-2 border rounded-full font-medium transition-all duration-300 ${isScrolled
                          ? "border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white"
                          : "border-white text-white hover:text-white/80"
                        }`}
                      style={{ fontSize: "15px", height: "40px" }}
                    >
                      Login
                    </Link>

                    {/* Mobile Login Icon */}
                    <Link
                      to="/signin"
                      className={`md:hidden flex flex-col items-center justify-center gap-1 ${textColor} transition-all duration-300 px-2 py-1.5 rounded-lg ${isScrolled ? "hover:bg-gray-100 hover:text-[#4F46E5]" : "hover:text-white/80"
                        }`}
                    >
                      <User size={20} strokeWidth={1.5} />
                    </Link>
                  </>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`lg:hidden ${textColor} hover:text-[#4F46E5]`}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white shadow-lg text-[#111827]">
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-100 border-transparent text-[#111827]"
                />
              </div>
            </div>
            <div className="px-4 py-2 space-y-1">
              {isAdmin
                ? adminNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold tracking-wide hover:bg-gray-50 text-[14px]"
                    style={{ color: isActive(link.path) ? "#4F46E5" : "#111827" }}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))
                : userNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg font-bold tracking-wide hover:bg-gray-50 hover:text-[#4F46E5] text-[14px]"
                    style={{ color: isActive(link.path) ? "#4F46E5" : "#111827" }}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
