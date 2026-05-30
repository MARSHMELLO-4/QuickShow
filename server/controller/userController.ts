import { Request, Response } from "express";
import "../middlewares/auth"; // Load type declarations
import Booking from "../models/booking";
import { clerkClient } from "@clerk/express";
import Movie from "../models/movie";

///api controller function to get user booking

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const user = req.auth?.userId;
    if(!user) return res.json({success : false, message : "User not authenticated"});
    
    const bookings = await Booking.find({ user })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res.json({ success: false, message: error.message });
    } else {
      console.error('Unknown error:', error);
      res.json({ success: false, message: 'An unknown error occurred' });
    }
  }
};


//api controller function to add favt movie 
export const addFavorite = async (req : Request, res : Response) => {
    try{
        const {movieId } = req.body;
        const userId = req.auth?.userId;
        if(!userId) return res.json({success : false, message : "No user Id exist"});
        if(!movieId) return res.json({success : false, message : "Movie ID is required"});
        
        const user = await clerkClient.users.getUser(userId);
        const metadata = user.privateMetadata as { favorites?: string[] };
        if(!metadata.favorites){
            metadata.favorites = []
        }

        if(!metadata.favorites.includes(movieId)){
            metadata.favorites.push(movieId);
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: metadata })

        res.json({success : true, message : "Favorite added successfully"});

    } catch(error : unknown){
        if(error instanceof Error){
            console.error(error);
            res.json({success : false, message : error.message})
        } else {
            console.error('Unknown error:', error);
            res.json({success : false, message : 'An unknown error occurred'});
        }
    }
}


//api controller for update favt
export const updateFavorite = async (req : Request, res : Response) => {
    try{
        const {movieId } = req.body;
        const userId = req.auth?.userId;
        if(!userId) return res.json({success : false, message : "No user Id exist"});
        if(!movieId) return res.json({success : false, message : "Movie ID is required"});
        
        const user = await clerkClient.users.getUser(userId);
        const metadata = user.privateMetadata as { favorites?: string[] };
        if(!metadata.favorites){
            metadata.favorites = []
        }

        if(!metadata.favorites.includes(movieId)){
            metadata.favorites.push(movieId);
        } else{
            metadata.favorites = metadata.favorites.filter(item => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: metadata })

        res.json({success : true, message : "Favorite updated successfully"});

    } catch(error : unknown){
        if(error instanceof Error){
            console.error(error);
            res.json({success : false, message : error.message})
        } else {
            console.error('Unknown error:', error);
            res.json({success : false, message : 'An unknown error occurred'});
        }
    }
}

//api controller to list favt movies 
export const getFavorites = async(req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        if(!userId) return res.json({success : false, message : "user id not found"});
        const user = await clerkClient.users.getUser(userId)
        const metadata = user.privateMetadata as { favorites?: string[] };
        const favorites = metadata.favorites || [];
        //get movie from the db 
        const movies = await Movie.find({ _id : {$in: favorites}})
        res.json({success : true, movies});
    } catch(error : unknown){
        if(error instanceof Error){
            console.error(error.message)
            res.json({success : false, message : error.message});
        } else {
            console.error('Unknown error:', error);
            res.json({success : false, message : 'An unknown error occurred'});
        }
    }
}