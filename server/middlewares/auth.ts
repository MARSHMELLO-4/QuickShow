//here we will create the function that will protect the admin routes 

import { clerkClient, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";


export const protectAdmin = async (req : Request, res : Response, next : NextFunction) => {
    try { 
        const { userId  } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await clerkClient.users.getUser(userId);

        if(user.privateMetadata.role != 'admin'){
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
        }

        next();
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
}