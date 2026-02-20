import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      lowercase: true,
      trim: true,
    },
    phonenumber: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Company address is required"],
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    country: {
      type: String,
    },
    website: {
      type: String,
    },
    industry: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    panNumber: {
      type: String,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
