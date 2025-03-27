import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(payload: any) {
        if (payload.access_token && !payload.sub) {
            try {
                const decoded = jwt.decode(payload.access_token);
                
                if (decoded && typeof decoded === 'object') {
                    return { userId: decoded.sub, email: decoded.email };
                }
            } catch (error) {
                console.error('Error decoding nested token:', error);
            }
        }
        
        return { userId: payload.sub, email: payload.email };
    }
}