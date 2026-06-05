import User from "../../models/user.model";
import { generateAccessToken } from "../../utils/jwt";

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("Email already exists");
  }

  const user = await User.create(data);

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};