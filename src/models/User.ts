import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/customError";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new AppError("Error comparing passwords", 400);
  }
};

export default mongoose.model<IUser>("User", UserSchema);
