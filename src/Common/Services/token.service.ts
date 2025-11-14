import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}


  // Generate Tokens
  generateToken(payload: object, options: JwtSignOptions) {
    return this.jwtService.sign(payload, options);
  }


    // Verify Tokens
    verifyToken(token: string, options: JwtVerifyOptions) {
      return this.jwtService.verify(token, options);
    }

}
