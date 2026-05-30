// API to check if user is admin

import { Request, Response } from "express";
import Booking from "../models/booking";
import Show from "../models/show";
import User from "../models/user";

export const isAdmin = async (req: Request, res: Response) => {
  res.json({
    success: true,
    isAdmin: true,
  });
};

// api to get dash board data

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");

    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    } else {
      console.error('Unknown error:', error);
      res.json({ success: false, message: 'An unknown error occurred' });
    }
  }
};


//api to get all shows 
export const getAllShows = async (req : Request, res : Response) => {
    try {
        const shows = await Show.find({ showDateTime : { $gte: new Date() }}).populate('movie').sort({ showDateTime : 1 });
        res.json({success : true, shows});
    } catch(err : unknown) {
      if(err instanceof Error){
        console.log(err.message);
        res.json({success : false, message : err.message})
      } else {
        console.error('Unknown error:', err);
        res.json({success : false, message : 'An unknown error occurred'});
      }
    }
}


//api to get all bookings 
export const getAllBookings = async (req : Request, res : Response) => {
  try {
    const bookings = await Booking.find({}).populate('user').populate({
      path : "show",
      populate : {path : "movie"}
    }).sort({createdAt : -1})
    res.json({success : true, bookings});
  } catch (error : unknown){
    if(error instanceof Error){
      console.error(error);
      res.json({success : false, message : error.message})
    } else {
      console.error('Unknown error:', error);
      res.json({success : false, message : 'An unknown error occurred'});
    }
  }
}