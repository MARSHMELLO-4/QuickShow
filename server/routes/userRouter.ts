import express from 'express';
import { getFavorites, getUserBookings, updateFavorite, addFavorite } from '../controller/userController';
import { protectAdmin } from '../middlewares/auth';

const userRouter = express.Router(); //this is the syntax to create the router 


userRouter.get('/bookings', getUserBookings);
userRouter.post('/add-favorite', addFavorite);
userRouter.post('/update-favorite', updateFavorite);
userRouter.get('/favorites', getFavorites);


export default userRouter;