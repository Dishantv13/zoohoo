import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
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
        
        },
        fullName: {
            type: String,
        
            trim: true,
            index: true
        }

    },
    {timestamps : true}
)
export const User = mongoose.model('User', userSchema)
