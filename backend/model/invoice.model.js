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
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PARTIALLY_PAID", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    invoiceDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: true,
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
    discount: {
      type: Number,
    },
    amountAfterDiscount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    amountPaid: {
        type: Number,   
        default: 0,
    },
    remainingAmount: {
        type: Number,
        default: function() {
            return this.totalAmount - this.amountPaid;
        },
    },
    paymentHistory: [
      {
        amount: Number,
        paymentMethod: {
          type: String,
          enum: ["CARD", "QR_CODE", "CASH"],
        },
        transactionId: String,
        paidAt: Date,
        paidBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true },
);

invoiceSchema.pre("save", function () {
    if(this.totalAmount && this.amountPaid >= 0) {
        this.remainingAmount = this.totalAmount - this.amountPaid;
    }
    if(this.remainingAmount < 0) {
        this.remainingAmount = 0;
    }
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
