import User from "../models/user.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("[Get All Users] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const makeAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.isAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "User is already an admin." });
    }

    user.isAdmin = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.username} is now an admin.`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[Make Admin] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const removeAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.isAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "User is not an admin." });
    }

    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin rights.",
      });
    }

    user.isAdmin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.username} is no longer an admin.`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[Remove Admin] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[Delete User] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("[Toggle User Status] Server error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
