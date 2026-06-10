const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      // candidate fields
      phone,
      city,
      headline,
      experience,
      // employer fields
      companyName,
      companyWebsite,
      industry,
      companySize,
      companyCity,
    } = req.body;

    const normalizedRole = (role || "candidate").toString().trim().toLowerCase();
    if (!name || !name.toString().trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || !email.toString().trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!['candidate', 'employer', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (normalizedRole === "employer" && (!companyName || !companyName.toString().trim())) {
      return res.status(400).json({ message: "Company name is required for employers" });
    }

    const normalizedCompanySize = ['1-10', '11-50', '51-200', '200+'].includes(companySize)
      ? companySize
      : "1-10";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.toString().trim(),
      email: email.toString().trim().toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
      // candidate fields
      ...(normalizedRole === "candidate" && {
        phone: phone || "",
        city: city || "",
        headline: headline || "",
        experience: experience || "fresher",
      }),
      // employer fields
      ...(normalizedRole === "employer" && {
        companyName: companyName || "",
        companyWebsite: companyWebsite || "",
        industry: industry || "",
        companySize: normalizedCompanySize,
        companyCity: companyCity || "",
      }),
    });

    await user.save();

    res.json({ message: "User registered successfully", userId: user._id, role: user.role });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(400).json({ message: "User already exists or invalid data" });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    const isProduction = process.env.NODE_ENV === "production";
    const baseCookie = {
      // Cross-origin frontend/backend on production requires SameSite=None + Secure.
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: maxAgeMs,
      path: "/",
    };

    // Auth cookie: httpOnly so JS can't read it
    res.cookie("token", token, { ...baseCookie, httpOnly: true });

    // UI cookies (not security sensitive; server still authorizes via JWT)
    res.cookie("session", "1", { ...baseCookie, httpOnly: false });
    res.cookie("role", user.role, { ...baseCookie, httpOnly: false });
    res.cookie("name", user.name || "", { ...baseCookie, httpOnly: false });
    res.cookie("email", user.email || "", { ...baseCookie, httpOnly: false });
    res.cookie("userId", String(user._id), { ...baseCookie, httpOnly: false });
    res.cookie("companyName", user.companyName || "", { ...baseCookie, httpOnly: false });

    res.json({
      message: "Login successful",
      // token is also set as an httpOnly cookie; keep returning it for backward compatibility
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName || "",
      isVerified: user.isVerified || false,
      isSuspended: user.isSuspended || false
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= LOGOUT ================= */
exports.logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const base = {
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  };

  res.clearCookie("token", { ...base, httpOnly: true });
  res.clearCookie("session", base);
  res.clearCookie("role", base);
  res.clearCookie("name", base);
  res.clearCookie("email", base);
  res.clearCookie("userId", base);
  res.clearCookie("companyName", base);

  res.json({ message: "Logged out" });
};

/* ================= ME ================= */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Me endpoint error:", err);
    res.status(500).json({ message: "Failed to load user" });
  }
};
/* ================= UPDATE USER CREDENTIALS ================= */
exports.updateCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.userId;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(
      userId,
      { email, password: hashedPassword },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Credentials updated successfully", user });
  } catch (err) {
    console.error("Update credentials error:", err);
    res.status(500).json({ message: "Failed to update credentials" });
  }
};

/* ================= VERIFY PASSWORD ================= */
exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json({ message: "Password verified successfully" });
  } catch (err) {
    console.error("Verify password error:", err);
    res.status(500).json({ message: "Password verification failed" });
  }
};
