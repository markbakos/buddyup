import { Request } from 'express'

export interface ExpressRequest extends Request {
    user: {
        userId: string;
        email: string;
    }
}