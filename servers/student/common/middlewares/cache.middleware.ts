import redis from "../redis";
import AppError from "../services/errors/app.error";
import { NextFunction, Response, Request } from "express";

const cacheMiddleware = (keyGetter: (request: Request) => string) => {
	return async (request: Request, response: Response, next: NextFunction) => {
        try {
            const redisClient = redis.getClient();

            const key = keyGetter(request);
			
			if (!key || !redisClient) return next();
            
			const cachedResponse = await redisClient?.get(key);

			if (cachedResponse)
				response.send(JSON.parse(cachedResponse));
			
			return next();

		} catch (error) {
            console.error(error);
			return next(new AppError('Error on cache middleware', 500));
		}
	};
};

export default cacheMiddleware;
