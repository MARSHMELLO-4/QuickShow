import  express  from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controller/showController";
import { protectAdmin } from "../middlewares/auth";


const showRouter = express.Router();

showRouter.get('/now-playing', getNowPlayingMovies); //this is how we add the middlewares to protect 
showRouter.post('/add',  addShow);
showRouter.get('/all', getShows);
showRouter.get('/:movieId', getShow);

export default showRouter;