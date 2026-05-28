//user model 

//scehma 
import mongoose from "mongoose";

export interface UserDataType {
    _id :  string,
    name : string,
    email : string,
    image : string,
}


const userSchema = new mongoose.Schema({
    _id : {
        type : String,
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    email: {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
    }
})


const User = mongoose.model('User', userSchema); //this is how we create the user


export default User;