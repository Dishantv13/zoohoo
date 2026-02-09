import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        name:{
            type : String,
            required : [true, "name is required"],
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            lowercase: true,
            trim: true,
         },
        phonenumber:{
            type: Number,
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minlength: [6, "password must be at least 6 characters"],
            select: false 
        },
        fullName: {
            type: String,
            trim: true,
            index: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    {timestamps : true}
)

userSchema.pre('save', async function(next) {
    if (!this.isModified('password'))
        return next();

    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema)
