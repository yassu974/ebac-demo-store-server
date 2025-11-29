export interface ITokenService {
  createToken(
    username: string,
    password: string,
    roles: string[]
  ): Promise<string>;
}