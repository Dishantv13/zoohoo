import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    rate: {
      type: Number,
    },
  },
  { timestamps: true },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
    },
    status:{
     type: String,
      enum: ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED'],
      default: 'PENDING',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invoiceDate: {
      type: Date,
    },
    dueDate:{
      type: Date,
      required:true
    },
    items: [itemSchema],
    subtotal: {
      type: Number,
    },
    parseTaxRate: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    parseDiscount: {
      type: Number,
    },
    discount : {
      type: Number,
    },
    amountAfterDiscount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },

    paymentDetails: {
      paymentMethod: {
        type: String,
        enum: ["CARD", "QR_CODE"],
      },
      transactionId: String,
      paidAt: Date,
      amountPaid: Number,
    },
  },
  { timestamps: true },
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
