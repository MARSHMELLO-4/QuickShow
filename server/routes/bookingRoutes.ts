import express from "express";
import { createBooking, getOcccupiedSeats } from "../controller/bookingController";
import { protectAdmin } from "../middlewares/auth";

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOcccupiedSeats);


export default bookingRouter;