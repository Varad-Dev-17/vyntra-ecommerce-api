import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Trash2, Shield, ShieldOff, Ban, UserCheck, 
  Users, CheckCircle2, ShieldAlert, RefreshCcw,
  Search, MoreVertical, Crown, Lock, Unlock, UserX
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import PageCard from "../admin/ui/PageCard";
import DataTable from "../admin/ui/DataTable";
import Pagination from "../admin/ui/Pagination";

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Actions Dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success("User deleted successfully");
        setActiveDropdown(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle-status`);
      if (res.data.success) {
        const isBlocked = res.data.user.isBlocked;
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isBlocked } : u))
        );
        toast.success(`User ${isBlocked ? "blocked" : "unblocked"}`);
        setActiveDropdown(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleMakeAdmin = async (id) => {
    try {
      const res = await api.patch(`/admin/users/make-admin/${id}`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isAdmin: true } : u))
        );
        toast.success("User promoted to admin");
        setActiveDropdown(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to make admin");
    }
  };

  const handleRemoveAdmin = async (id) => {
    try {
      const res = await api.patch(`/admin/users/remove-admin/${id}`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isAdmin: false } : u))
        );
        toast.success("Admin rights removed");
        setActiveDropdown(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove admin");
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, sortBy]);

  // Derived state
  const { filteredAndSortedUsers, stats } = useMemo(() => {
    let result = [...users];

    // Stats calculation
    const total = result.length;
    let active = 0;
    let admins = 0;
    let restricted = 0;

    result.forEach(u => {
      if (u.verified && !u.isBlocked) active++;
      if (u.isAdmin) admins++;
      if (u.isBlocked) restricted++;
    });

    // 1. Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(u => 
        u.username?.toLowerCase().includes(lowerSearch) || 
        u.email?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Role filter
    if (roleFilter === "admin") result = result.filter(u => u.isAdmin);
    if (roleFilter === "user") result = result.filter(u => !u.isAdmin);

    // 3. Status filter
    if (statusFilter === "verified") result = result.filter(u => u.verified && !u.isBlocked);
    if (statusFilter === "pending") result = result.filter(u => !u.verified && !u.isBlocked);
    if (statusFilter === "blocked") result = result.filter(u => u.isBlocked);

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name-asc") return (a.username || "").localeCompare(b.username || "");
      if (sortBy === "name-desc") return (b.username || "").localeCompare(a.username || "");
      return 0;
    });

    return { filteredAndSortedUsers: result, stats: { total, active, admins, restricted } };
  }, [users, search, roleFilter, statusFilter, sortBy]);

  // Pagination
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentUsers = filteredAndSortedUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const columns = [
    {
      header: 'USER',
      accessor: 'username',
      align: 'left',
      headerAlign: 'left',
      width: '40%',
      render: (row) => (
        <div className="flex items-center gap-4 py-2 pl-2">
          <div className="w-10 h-10 rounded-full bg-[#e8e8fb] flex items-center justify-center text-[#4648d4] font-bold text-sm shrink-0">
            {row.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-slate-800 text-[13px] leading-tight mb-1">{row.username}</span>
            <span className="text-slate-500 text-[11.5px] leading-tight">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      align: 'left',
      headerAlign: 'left',
      width: '18%',
      render: (row) => {
        let label = "Pending";
        let style = "bg-amber-50 text-amber-600 border border-amber-100";
        if (row.isBlocked) {
          label = "Blocked";
          style = "bg-red-50 text-red-600 border border-red-100";
        } else if (row.verified) {
          label = "Verified";
          style = "bg-emerald-50 text-emerald-600 border border-emerald-100";
        }
        return (
          <div className="flex items-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${style}`}>
              {row.verified && !row.isBlocked && <CheckCircle2 size={12} className="text-emerald-500" />}
              {row.isBlocked && <Ban size={12} className="text-red-500" />}
              {label}
            </span>
          </div>
        );
      }
    },
    {
      header: 'ROLE',
      accessor: 'role',
      align: 'left',
      headerAlign: 'left',
      width: '16%',
      render: (row) => (
        <div className="flex items-center">
          <select
            value={row.isAdmin ? "admin" : "user"}
            onChange={(e) => {
              if (e.target.value === "admin") {
                handleMakeAdmin(row._id);
              } else {
                handleRemoveAdmin(row._id);
              }
            }}
            className={`pl-3 pr-7 py-1 text-[11.5px] font-semibold rounded-full outline-none cursor-pointer transition-colors ${
              row.isAdmin
                ? "bg-[#e8e8fb] text-[#4648d4] border border-[#d2d2f7]"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <option value="user" className="text-slate-700 bg-white font-medium">User</option>
            <option value="admin" className="text-[#4648d4] bg-white font-medium">Admin</option>
          </select>
        </div>
      )
    },
    {
      header: 'JOINED',
      accessor: 'createdAt',
      align: 'left',
      headerAlign: 'left',
      width: '16%',
      render: (row) => {
        const dateStr = new Date(row.createdAt).toLocaleDateString("en-GB", {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        return (
          <div className="flex items-center">
             <span className="text-slate-600 text-xs font-medium">{dateStr}</span>
          </div>
        );
      }
    },
    {
      header: 'ACTIONS',
      align: 'right',
      headerAlign: 'right',
      width: '10%',
      render: (row) => (
        <div className="flex items-center justify-end gap-2 pr-4">
          <button
            onClick={() => handleToggleStatus(row._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isBlocked
                ? "text-emerald-500 hover:bg-emerald-50"
                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
            }`}
            title={row.isBlocked ? "Unblock User" : "Block User"}
          >
            {row.isBlocked ? <UserCheck size={16} /> : <Ban size={16} />}
          </button>
          
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1a2e] tracking-tight mb-1">User Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage customer accounts, access, roles, and account status.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin text-[#4648d4]" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f0f0fd] flex items-center justify-center shrink-0">
            <Users className="text-[#4648d4]" size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-600">Total Users</p>
            <h3 className="text-[26px] font-bold text-slate-800 leading-tight mt-0.5">{stats.total}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">All registered users</p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-emerald-500" size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-600">Active Users</p>
            <h3 className="text-[26px] font-bold text-slate-800 leading-tight mt-0.5">{stats.active}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Verified & active</p>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f3f0ff] flex items-center justify-center shrink-0">
            <Shield className="text-[#8b5cf6]" size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-600">Admins</p>
            <h3 className="text-[26px] font-bold text-slate-800 leading-tight mt-0.5">{stats.admins}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Administrators</p>
          </div>
        </div>

        {/* Restricted Users */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <ShieldAlert className="text-rose-500" size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-600">Restricted Users</p>
            <h3 className="text-[26px] font-bold text-slate-800 leading-tight mt-0.5">{stats.restricted}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Blocked or restricted</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <PageCard>
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 border-b border-slate-100 bg-white">
          <div className="relative w-full md:w-auto md:min-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-[10px] outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors text-[13px] font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
          </div>
          
          <div className="flex items-center justify-end gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-[10px] outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] text-[13px] font-medium text-slate-700 cursor-pointer min-w-[120px] shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-[10px] outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] text-[13px] font-medium text-slate-700 cursor-pointer min-w-[120px] shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-[10px] outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] text-[13px] font-medium text-slate-700 cursor-pointer min-w-[150px] shadow-sm"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <DataTable
            columns={columns}
            data={currentUsers}
            isLoading={loading}
            emptyMessage="No users found."
            noBorders={true}
          />
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white rounded-b-[20px]">
          <div className="text-[13px] font-medium text-slate-500">
            {totalItems > 0 ? (
              <>Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, totalItems)} of {totalItems} users</>
            ) : (
              <>Showing 0 users</>
            )}
          </div>
          {totalItems > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </PageCard>
    </div>
  );
};

export default UsersSection;
