import { useState, useEffect } from "react";
import { Trash2, Shield, ShieldOff, Ban, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import PageCard from "../admin/ui/PageCard";
import SearchToolbar from "../admin/ui/SearchToolbar";
import DataTable from "../admin/ui/DataTable";

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove admin");
    }
  };

  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'User',
      accessor: 'username',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#4648d4] to-[#6b38d4] flex items-center justify-center text-white text-xs font-bold">
            {row.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="font-medium text-[#1a1a2e]">
            {row.username}
          </span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => <span className="text-gray-500">{row.email}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            row.isBlocked
              ? "bg-red-50 text-red-600"
              : row.verified
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {row.isBlocked ? "Blocked" : row.verified ? "Verified" : "Pending"}
        </span>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            row.isAdmin
              ? "bg-[#4648d4]/10 text-[#4648d4]"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.isAdmin ? "Admin" : "User"}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (row) => <span className="text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.isAdmin ? (
            <button
              onClick={() => handleRemoveAdmin(row._id)}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove Admin Rights"
            >
              <ShieldOff size={18} />
            </button>
          ) : (
            <button
              onClick={() => handleMakeAdmin(row._id)}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Make Admin"
            >
              <Shield size={18} />
            </button>
          )}

          <button
            onClick={() => handleToggleStatus(row._id)}
            className={`p-2 rounded-lg transition-colors ${
              row.isBlocked
                ? "text-emerald-600 hover:bg-emerald-50"
                : "text-amber-600 hover:bg-amber-50"
            }`}
            title={row.isBlocked ? "Unblock User" : "Block User"}
          >
            {row.isBlocked ? <UserCheck size={18} /> : <Ban size={18} />}
          </button>

          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <PageCard>
      <SearchToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name or email..."
      />
      <div className="flex-1 overflow-y-auto">
        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={loading}
          emptyMessage="No users found."
        />
      </div>
    </PageCard>
  );
};

export default UsersSection;
