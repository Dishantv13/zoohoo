import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phonenumber: {
      type: Number,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
