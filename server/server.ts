import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './configs/db';
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express'
import { inngest,functions } from './inngest';

const app = express();
const port = 3000;
const startServer = async () => {
    await connectDb();

    app.listen(3000, () => {
        console.log("Server running");
    });
};

startServer(); // the connecttion will start

//middleware
app.use(express.json()) //all the req will be passed through the json format in this server
app.use(cors()); //cors middleware
app.use(clerkMiddleware())

//api routes 
app.get('/', (req,res) => res.send('server is live'))
app.use("/api/inngest", serve({ client: inngest, functions }));


app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
    
})