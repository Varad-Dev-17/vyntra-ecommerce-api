import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  User,
  UserCircle,
  Menu,
  X,
  Search,
  LogOut,
  Lock,
  ChevronDown,
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount] = useState(2);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const userNavLinks = [
    { name: "Shop Now" , path: "/products" },
    { name: "Trending Products", path: "/trending" },
    { name: "New Arrivals", path: "/new-arrivals" },
  ];

  const adminNavLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/signin");
  };

  const isAdmin = user?.isAdmin;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isAdmin
          ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 "
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to={isAdmin ? "/admin/dashboard" : "/home"}
            className="flex items-center gap-2"
          >
            <span
              className="text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "Manrope, sans-serif",
                color: "#4648d4",
                letterSpacing: "-0.01em",
              }}
            >
              Vyntra
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {isAdmin
              ? adminNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative flex items-center gap-1.5 font-medium transition-colors group py-1"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      fontSize: "16px",
                      color: isActive(link.path) ? "#4648d4" : "#464554",
                    }}
                  >
                    <link.icon
                      className="w-4 h-4"
                      style={{ color: "#4648d4" }}
                    />
                    {link.name}
                    {/* Dash underline - active state */}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#4648d4] transition-all duration-300 ${
                        isActive(link.path)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                      style={{ borderRadius: "2px" }}
                    />
                  </Link>
                ))
              : userNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative font-medium transition-colors group py-1"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      fontSize: "16px",
                      color: isActive(link.path) ? "#4648d4" : "#464554",
                    }}
                  >
                    {link.name}
                    {/* Dash underline - active state */}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#4648d4] transition-all duration-300 ${
                        isActive(link.path)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                      style={{ borderRadius: "2px" }}
                    />
                  </Link>
                ))}
          </div>

          {/* Search Bar - Desktop (only for users) */}
          {!isAdmin && (
            <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#767586" }}
                />
                <input
                  type="text"
                  placeholder="Search curated goods..."
                  className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    background: "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(30, 41, 59, 0.1)",
                    color: "#1b1b23",
                    "--tw-ring-color": "#4648d4",
                  }}
                />
              </div>
            </div>
          )}

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* Cart - only for non-admin users */}
            {!isAdmin && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full transition-colors hover:bg-[#f5f2fe]"
              >
                <ShoppingCart
                  className="w-5 h-5"
                  style={{ color: "#464554" }}
                />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: "#4648d4" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1 p-2 rounded-full transition-colors hover:bg-[#f5f2fe]"
                >
                  <UserCircle
                    className="w-6 h-6"
                    style={{ color: "#4648d4" }}
                    fill="rgba(70, 72, 212, 0.1)"
                  />
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    style={{ color: "#767586" }}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-xl border"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {/* User Info */}
                    <div
                      className="px-5 py-4 border-b"
                      style={{ borderColor: "rgba(199, 196, 215, 0.3)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: "#e1e0ff" }}
                        >
                          <User
                            className="w-5 h-5"
                            style={{ color: "#4648d4" }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p
                            className="font-semibold truncate"
                            style={{
                              fontFamily: "Manrope, sans-serif",
                              fontSize: "14px",
                              color: "#1b1b23",
                            }}
                          >
                            {user.username || "User"}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{
                              fontFamily: "Be Vietnam Pro, sans-serif",
                              color: "#767586",
                            }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2 space-y-1">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors hover:bg-[#f5f2fe] opacity-60 cursor-not-allowed"
                        disabled
                      >
                        <Lock
                          className="w-5 h-4"
                          style={{ color: "#767586" }}
                        />
                        <span
                          style={{
                            fontFamily: "Be Vietnam Pro, sans-serif",
                            fontSize: "14px",
                            color: "#464554",
                          }}
                        >
                          <Link
                            to="/change-password"
                            className="w-full flex items-center gap-1 px-2 py-2 rounded-xl text-left transition-colors hover:bg-[#f5f2fe]"
                            onClick={() => setIsProfileOpen(false)}
                            style={{ textDecoration: "none" }}
                          >
                            <span
                              style={{
                                fontFamily: "Be Vietnam Pro, sans-serif",
                                fontSize: "14px",
                                color: "#464554",
                              }}
                            >
                              Change Password
                            </span>
                          </Link>
                        </span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors hover:bg-[#ffdad6]"
                      >
                        <LogOut
                          className="w-4 h-4"
                          style={{ color: "#ba1a1a" }}
                        />
                        <span
                          style={{
                            fontFamily: "Be Vietnam Pro, sans-serif",
                            fontSize: "14px",
                            color: "#ba1a1a",
                            fontWeight: 500,
                          }}
                        >
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  background:
                    "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                  boxShadow: "0 4px 16px rgba(70, 72, 212, 0.25)",
                }}
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-[#f5f2fe]"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" style={{ color: "#464554" }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: "#464554" }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(199, 196, 215, 0.3)",
          }}
        >
          <div className="px-4 py-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#767586" }}
              />
              <input
                type="text"
                placeholder="Search curated goods..."
                className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 text-sm"
                style={{
                  fontFamily: "Be Vietnam Pro, sans-serif",
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(30, 41, 59, 0.1)",
                  color: "#1b1b23",
                  "--tw-ring-color": "#4648d4",
                }}
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors hover:bg-[#f5f2fe]"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      color: isActive(link.path) ? "#4648d4" : "#464554",
                      fontSize: "16px",
                    }}
                  >
                    <link.icon
                      className="w-4 h-4"
                      style={{ color: "#4648d4" }}
                    />
                    {link.name}
                  </Link>
                ))
              : userNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg font-medium transition-colors hover:bg-[#f5f2fe]"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      color: isActive(link.path) ? "#4648d4" : "#464554",
                      fontSize: "16px",
                    }}
                  >
                    {link.name}
                  </Link>
                ))}

            {user ? (
              <>
                <div
                  className="px-3 py-2 mt-2 rounded-xl"
                  style={{ background: "#f5f2fe" }}
                >
                  <p
                    className="font-semibold"
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "14px",
                      color: "#1b1b23",
                    }}
                  >
                    {user.username || "User"}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      color: "#767586",
                    }}
                  >
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-white font-semibold text-sm"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    background: "#ba1a1a",
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block mt-2 px-3 py-2.5 rounded-full text-center text-white font-semibold text-sm transition-all active:scale-95"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  background:
                    "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
