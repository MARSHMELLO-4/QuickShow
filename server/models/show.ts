import mongoose from "mongoose";


export interface ShowType {
    _id?: mongoose.Types.ObjectId,

    movie: string,

    showDateTime: Date,

    showPrice: number,

    occupiedSeats: Record<string, string>
}

const showSchema = new mongoose.Schema({
    movie : {
        type : String,
        ref : 'Movie',
        required : true
    },
    showDateTime : {type : Date, required : true},
    showPrice : {type : Number, required : true},
    occupiedSeats : {type : Object, default : {}},
}, { minimize : false })

const Show = mongoose.model("Show", showSchema);

export default Show;