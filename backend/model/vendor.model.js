import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true },
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
