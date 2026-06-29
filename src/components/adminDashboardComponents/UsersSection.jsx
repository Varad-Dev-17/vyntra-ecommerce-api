import React, { useState, useEffect } from "react";
import { Trash2, Shield, ShieldOff, Ban, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/all-users");
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
      const res = await api.patch(`/admin/make-admin/${id}`);
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
      const res = await api.patch(`/admin/remove-admin/${id}`);
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope'] mb-6">
        User Management
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      user.isBlocked ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#4648d4] to-[#6b38d4] flex items-center justify-center text-white text-xs font-bold">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-sm font-medium text-[#1a1a2e]">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isBlocked
                            ? "bg-red-50 text-red-600"
                            : user.verified
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {user.isBlocked
                          ? "Blocked"
                          : user.verified
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isAdmin
                            ? "bg-[#4648d4]/10 text-[#4648d4]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          title={user.isBlocked ? "Unblock user" : "Block user"}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBlocked
                              ? "hover:bg-emerald-50 text-gray-400 hover:text-emerald-500"
                              : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                          }`}
                        >
                          {user.isBlocked ? (
                            <UserCheck size={18} />
                          ) : (
                            <Ban size={18} />
                          )}
                        </button>

                        {user.isAdmin ? (
                          <button
                            onClick={() => handleRemoveAdmin(user._id)}
                            title="Remove admin"
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <ShieldOff size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMakeAdmin(user._id)}
                            title="Make admin"
                            className="p-2 rounded-lg hover:bg-[#4648d4]/10 text-gray-400 hover:text-[#4648d4] transition-colors"
                          >
                            <Shield size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(user._id)}
                          title="Delete user"
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersSection;
