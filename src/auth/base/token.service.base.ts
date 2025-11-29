/* eslint-disable import/no-unresolved */
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { INVALID_PASSWORD_ERROR, INVALID_USERNAME_ERROR } from "../constants";
import { ITokenService } from "../ITokenService";

/**
 * TokenServiceBase is a jwt bearer implementation of ITokenService
 */
@Injectable()
export class TokenServiceBase implements ITokenService {
  constructor(protected readonly jwtService: JwtService) {}

  /**
   * @param username
   * @param password
   * @param roles
   * @returns a jwt token signed with the username and roles
   */
  createToken(
    username: string,
    password: string,
    roles: string[]
  ): Promise<string> {
    if (!username) return Promise.reject(INVALID_USERNAME_ERROR);
    if (!password) return Promise.reject(INVALID_PASSWORD_ERROR);

    return this.jwtService.signAsync({ username, roles });
  }
}