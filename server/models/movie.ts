import mongoose from "mongoose";


export interface MovieType {
    _id : string,
    title : string,
    overview : string,
    poster_path : string,
    backdrop_path : string,
    release_date : string,
    original_language : string,
    tagline : string,
    genres : string[],
    casts : string[],
    vote_average : number,
    runtime : number,
}

const movieSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
    required: true,
  },
  poster_path: {
    type: String,
    required: true,
  },
  backdrop_path: {
    type: String,
    required: true,
  },
  release_date: {
    type: String,
    required: true,
  },
  original_language: { type: String },
  tagline: { type: String },
  genres: {
    type: Array,
    required: true,
  },
  casts: {
    type: Array,
    required: true,
  },
  vote_average: {
    type: Number,
    required: true,
  },
  runtime: {
    type: Number,
    required: true,
  },
}, {timestamps : true});

//now create the model using this scehma 

const Movie = mongoose.model('Movie', movieSchema)

export default Movie;
