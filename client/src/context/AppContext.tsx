import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

interface AppContextType {
    axios: typeof axios;
    fetchIsAdmin: () => Promise<void>;
    user: any;
    getToken: () => Promise<string | null>;
    navigate: any;
    isAdmin: boolean;
    shows: any[];
    favoriteMovies: any[];
    fetchFavtMovies: () => Promise<void>;
    isLoading: boolean;
}

export const AppContext = createContext<AppContextType | null>(null);


export const AppProvider = ({ children }: { children: ReactNode }) => {

    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const {user, isLoaded: userLoaded} = useUser();
    const {getToken} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const fetchIsAdmin = async() => {
        try{
            if (!userLoaded) return; // Wait for Clerk to load
            
            const token = await getToken();
            if (!token) {
                setIsAdmin(false);
                return;
            }

            const {data} = await axios.get('/api/admin/is-admin', {
                headers :  { Authorization: `Bearer ${token}`}
            });
            setIsAdmin(data.isAdmin);

            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard');
            }

        } catch(error : unknown){
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        }
    }

    const fetchShows = async() => {
        try {
            const { data } = await axios.get('/api/show/all');
            if(data.success){
                setShows(data.shows);
            } else{
                toast.error(data.message || 'Failed to fetch shows');
            }
        } catch (error : unknown){
            console.error('Error fetching shows:', error);
            toast.error('Failed to fetch shows');
        } 
    }
    
    const fetchFavtMovies = async () => {
        try{
            if (!userLoaded) return; // Wait for Clerk to load
            
            const token = await getToken();
            if (!token) {
                setFavoriteMovies([]);
                return;
            }

            const { data } = await axios.get('/api/user/favorites', {
                headers : { Authorization : `Bearer ${token}`}
            })

            if(data.success){
                setFavoriteMovies(data.movies);
            } else{
                toast.error(data.message || 'Failed to fetch favorites')
            }
        } catch(error : unknown){
            console.error('Error fetching favorites:', error)
            setFavoriteMovies([]);
        }
    }

    useEffect(() => {
        // Set loading to false once Clerk is loaded
        if (userLoaded) {
            setIsLoading(false);
        }
    }, [userLoaded])

    useEffect(() => {
        fetchShows();
    }, [])

    useEffect(() => {
        if(userLoaded){
            if(user){
                fetchIsAdmin();
                fetchFavtMovies()
            } else {
                setIsAdmin(false);
                setFavoriteMovies([]);
            }
        }
    }, [user, userLoaded]);

    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows,
        favoriteMovies, fetchFavtMovies, isLoading
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}


export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};