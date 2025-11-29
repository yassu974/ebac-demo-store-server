import { UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IAuthStrategy } from "../../IAuthStrategy";
// @ts-ignore
// eslint-disable-next-line
import { UserService } from "../../user/user.service";
import { UserInfo } from "../../UserInfo";

export class JwtStrategyBase
  extends PassportStrategy(Strategy)
  implements IAuthStrategy {
  constructor(
    protected readonly userService: UserService,
    protected readonly secretOrKey: string
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: UserInfo): Promise<UserInfo> {
    if (!payload || !payload.username) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
