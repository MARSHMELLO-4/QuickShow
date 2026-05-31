import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './configs/db';
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express'
import { inngest,functions } from './inngest';
import showRouter from './routes/showRoutes';
import bookingRouter from './routes/bookingRoutes';
import adminRouter from './routes/adminRoutes';
import userRouter from './routes/userRouter';
import { stripeWebhooks } from './controller/stripeWebhooks';

const app = express();
const port = process.env.PORT || 3000;


//stripe middleware hook 
app.use('api/stripe', express.raw({type : 'application/json'}), stripeWebhooks)

//middleware
app.use(express.json()) //all the req will be passed through the json format in this server
app.use(cors()); //cors middleware
app.use(clerkMiddleware())

//api routes 
app.get('/', (req,res) => res.send('server is live'))
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter); //this is the base url and we have to append the showRouter
app.use('/api/booking', bookingRouter);  //this is the base url for the bookings 
app.use('/api/admin', adminRouter) //this route will be used to get all the related data to admin
app.use('/api/user', userRouter) //this is the userroute

const startServer = async () => {
    await connectDb();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

startServer(); // the connection will start