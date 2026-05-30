//here we will create the function that will protect the admin routes 

import { clerkClient, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

// Extend Express Request type to include auth property
declare global {
    namespace Express {
        interface Request {
            auth?: { userId: string };
        }
    }
}

export const protectAdmin = async (req : Request, res : Response, next : NextFunction) => {
    try { 
        const auth = getAuth(req);
        const { userId  } = auth;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await clerkClient.users.getUser(userId);

        if(user.privateMetadata.role != 'admin'){
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
        }

        // Attach auth to request object
        req.auth = auth;
        next();
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
}