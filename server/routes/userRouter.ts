import express from 'express';
import { getFavorites, getUserBookings, updateFavorite, addFavorite } from '../controller/userController';
import { protectAdmin, protectUser } from '../middlewares/auth';

const userRouter = express.Router(); //this is the syntax to create the router 


userRouter.get('/bookings',protectUser, getUserBookings);
userRouter.post('/add-favorite',protectUser, addFavorite);
userRouter.post('/update-favorite',protectUser,  updateFavorite);
userRouter.get('/favorites',protectUser, getFavorites);


export default userRouter;