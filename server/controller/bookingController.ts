//function to check the availablity of the seat of the movie 

import mongoose from "mongoose";
import Show from "../models/show";

const checkSeatAvailability = async (showId : mongoose.Types.ObjectId, selectedSeats : string[]) => {
    try {
        const showData = await Show.findById(showId);
    } catch(error : unknown){
        if(error instanceof Error){
            console.log(error.message);
        }
    }
}