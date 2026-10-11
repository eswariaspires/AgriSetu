
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const {
  name,
  email,
  password,
  role,
  phone,
  district,
  state,
} = req.body;

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!["farmer", "buyer"].includes(role)) {
      return res.status(400).json({
        message: "Role must be farmer or buyer.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  password: hashedPassword,
  role,
  phone,
  district,
  state,
});

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
  district: user.district,
  state: user.state,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Unable to create account.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
  district: user.district,
  state: user.state,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
};