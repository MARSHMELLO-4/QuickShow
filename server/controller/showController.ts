import axios from "axios";
import { Request, Response } from "express";
import Movie, { MovieType } from "../models/movie";
import Show, { ShowType } from "../models/show";
import { error } from "node:console";

const axiosConfig = {
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
  timeout: 10000,
};

const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  try {
    return await axios.get(url, axiosConfig);
  } catch (err) {
    if (retries === 0) throw err;

    if (
      axios.isAxiosError(err) &&
      (err.code === "ECONNRESET" || err.code === "ETIMEDOUT")
    ) {
      console.log(`Retrying request... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, retries - 1);
    }
    throw err;
  }
};

//API to get nowplaying movies
export const getNowPlayingMovies = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
      axiosConfig,
    );

    const movies = data.results;
    res.json({ success: true, movies: movies });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("TMDB API Error:", err.message, err.code);
      res.json({
        success: false,
        message: `API Error: ${err.code} - ${err.message}`,
      });
    } else if (err instanceof Error) {
      res.json({
        success: false,
        message: err.message,
      });
    }
  }
};

//constroller to add new show

export const addShow = async (req: Request, res: Response) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      //if the movie is not avail in the db then
      //fetch the movie from the db with retry
      try {
        const [movieDetailsResponse, movieCreditsReponse] = await Promise.all([
          fetchWithRetry(
            `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
          ),
          fetchWithRetry(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
          ),
        ]);

        const movieApiData = movieDetailsResponse.data;
        const movieCreditsData = movieCreditsReponse.data;

        const movieDetails: MovieType = {
          _id: movieId,
          title: movieApiData.title,
          overview: movieApiData.overview,
          poster_path: movieApiData.poster_path,
          backdrop_path: movieApiData.backdrop_path,
          genres: movieApiData.genres,
          casts: movieCreditsData.cast,
          release_date: movieApiData.release_date,
          original_language: movieApiData.original_language,
          tagline: movieApiData.tagline,
          vote_average: movieApiData.vote_average,
          runtime: movieApiData.runtime,
        };

        //add movie to db
        movie = await Movie.create(movieDetails);
      } catch (apiErr: unknown) {
        if (axios.isAxiosError(apiErr)) {
          console.error(
            "Failed to fetch movie from TMDB:",
            apiErr.message,
            apiErr.code,
          );
          return res.json({
            success: false,
            message: `Failed to fetch movie details: ${apiErr.code} - ${apiErr.message}`,
          });
        }
        throw apiErr;
      }
    }

    const showsToCreate: ShowType[] = [];
    showsInput.forEach((show: any) => {
      const showDate = show.date;
      show.time.forEach((time: any) => {
        const dateTimeString = `${showDate}T${time}:00`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({
      success: true,
      message: "Show Added successfully",
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error in addShow:", err.code, err.message);
      res.json({
        success: false,
        message: `Network error: ${err.code} - ${err.message}`,
      });
    } else if (err instanceof Error) {
      console.error(err);
      res.json({ success: false, message: err.message });
    }
  }
};

//api to get all shows from db

export const getShows = async (req: Request, res: Response) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // filter unique shows
    const uniqueShows = new Set(shows.map((show) => show.movie));

    res.json({ success: true, shows: Array.from(uniqueShows) });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error);
      res.json({ success: false, message: error.message });
    }
  }
};

//api to get single show frmo the database
export const getShow = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });
    const movie = await Movie.findById(movieId);
    const dateTime: Record<string, any[]> = {};
    shows.forEach((show: ShowType) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });
    res.json({ success: true, movie, dateTime });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error);
      res.json({
        success: false,
        message: error.message,
      });
    }
  }
};
