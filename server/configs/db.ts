import mongoose from "mongoose";


const connectDb = async () => {
    try {
        mongoose.connection.on("connected", () => console.log('Database connected'))
        await mongoose.connect(`${process.env.MONGO_DB_URI}`)
    } catch (err : unknown) {
        if(err instanceof Error) console.log(err.message)
    } 
}


export default connectDb;