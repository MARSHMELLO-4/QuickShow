import mongoose, { Mongoose } from "mongoose";


const bookingSchema = new mongoose.Schema({
    user : {type : String, required : true, ref : 'User'},
    show : {type : String,required : true, ref : 'Show'},
    amount : {type : Number, required : true},
    bookedSeats : {type : Array, required : true},
    isPaid : {type : Boolean, default: false},
    paymentLink : {type : String},
}, {timestamps : true});


//now we will ceate the scehma og it 
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;