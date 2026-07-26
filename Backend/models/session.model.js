import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"user is required"]
    },
    refreshTokenHash:{
        type:String,
        required : [true,"Refresh token hash is required"]
    },
    revoked:{
        type:Boolean,
        default:false
    }
},{
    timestamps : true
})

const Session = mongoose.model("Session",sessionSchema)
export default Session