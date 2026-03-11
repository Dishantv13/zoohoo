import mongoose, { Schema } from "mongoose";

const billSchema = new Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    billDate: { 
        type: Date,
        default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        quantity: {
          type: Number,
        },
        rate: {
          type: Number,
        },
      },
    ],
    totalAmount: {
      type: Number,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        paymentMethod: {
          type: String,
          enum: ["CARD", "QR_CODE", "CASH"],
          required: true,
        },
        transactionId: {
          type: String,
          required: true,
        },
        paidAt: {
          type: Date,
          default: Date.now,
        },
        paidBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIALLY_PAID"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Bill = mongoose.model("Bill", billSchema);
