import { Injectable } from "@nestjs/common";
import { TokenServiceBase } from "./base/token.service.base";

@Injectable()
export class TokenService extends TokenServiceBase {}