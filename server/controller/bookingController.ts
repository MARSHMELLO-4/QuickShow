//function to check the availablity of the seat of the movie 

import mongoose from "mongoose";
import { Request, Response } from "express";
import Show, { ShowType } from "../models/show";
import Booking from "../models/booking";

const checkSeatAvailability = async (showId : mongoose.Types.ObjectId, selectedSeats : string[]) => {
    try {
        const showData = await Show.findById(showId);
        if(!showData){
            return false;
        }

        const occupiedSeats = showData?.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]); //this is true 

        return !isAnySeatTaken
    } catch(error : unknown){
        if(error instanceof Error){
            console.log(error.message);
        }
        return false;
    }
}


export const createBooking = async(req : Request, res : Response)  => {
    try{
        const userId = req.auth?.userId;
        const {showId , selectedSeats } = req.body;

        //origin also 
        const { origin } = req.headers;

        //check if the seat is available for the selected show 
        const isAvailable = await checkSeatAvailability(showId,selectedSeats);

        if(!isAvailable){
            return res.json({success : false, message : "selected seats are not available"})
        }

        //get the show details 
        const showData = await Show.findById(showId).populate('movie');

        if (!showData) {
            return res.json({ success: false, message: "Show not found" });
        }

        //create a new booking 
        const booking = await Booking.create({
            user : userId,
            show : showId,
            amount : showData.showPrice * selectedSeats.length,
            bookedSeats : selectedSeats
        })

        //reserve the seats 
        selectedSeats.map((seat : any) => {
            showData.occupiedSeats[seat] = userId
        })

        showData.markModified('occupiedSeats')

        await showData.save();

        // stripe gateway initialize 

        res.json({
            success : true,
            message : 'Booked successfully',
        })

    } catch(error : unknown){
        if(error instanceof Error){
            console.log(error.message);
            res.json({success : false, message : error.message})
        } else {
            console.error('Unknown error:', error);
            res.json({success : false, message : 'An unknown error occurred'})
        }
    }
}


export const getOcccupiedSeats = async(req : Request, res : Response) => {
    try {
        const { showId }  = req.params;
        if (!showId) {
            return res.json({success : false, message : "Show ID is required"});
        }
        const showData = await Show.findById(showId);
        
        if (!showData) {
            return res.json({success : false, message : "Show not found"});
        }

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        return res.json({success : true, occupiedSeats})

    } catch(err : unknown){
        if(err instanceof Error){
            console.log(err.message);
            res.json({ success : false, message : err.message });
        } else {
            console.error('Unknown error:', err);
            res.json({ success : false, message : 'An unknown error occurred' });
        }
    } 
}