import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

type JwtPayload = {
  sub: number;
  email: string;
  name: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_ACCESS_EXPIRES as StringValue,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET as string,
      expiresIn: process.env.JWT_REFRESH_EXPIRES as StringValue,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  private getRefreshTokenExpiresAt(): Date {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES;

    if (expiresIn?.endsWith('d')) {
      const days = Number(expiresIn.slice(0, -1));
      return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    if (expiresIn?.endsWith('h')) {
      const hours = Number(expiresIn.slice(0, -1));
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    if (expiresIn?.endsWith('m')) {
      const minutes = Number(expiresIn.slice(0, -1));
      return new Date(Date.now() + minutes * 60 * 1000);
    }

    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginUserDto.email);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const credential = await this.usersService.findCredentialByUserId(user.id);

    if (!credential) {
      throw new BadRequestException(
        'У пользователя отсутствуют учетные данные',
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginUserDto.password,
      credential.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Неверный пароль');
    }

    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.updateRefreshToken(
      user.id,
      refreshTokenHash,
      this.getRefreshTokenExpiresAt(),
    );

    return {
      message: 'Пользователь авторизован',
      userName: user.name,
      ...tokens,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.findOneByEmail(registerUserDto.email);

    if (user) {
      throw new BadRequestException('Пользователь уже существует');
    }

    const newUser = await this.usersService.create(registerUserDto);

    const tokens = await this.generateTokens(newUser);
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.updateRefreshToken(
      newUser.id,
      refreshTokenHash,
      this.getRefreshTokenExpiresAt(),
    );

    return {
      message: 'Пользователь зарегистрирован',
      userName: newUser.name,
      ...tokens,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    const storedRefreshToken =
      await this.usersService.findRefreshTokenByUserId(userId);

    if (!storedRefreshToken?.tokenHash) {
      throw new BadRequestException('Refresh token отсутствует');
    }

    if (storedRefreshToken.expiresAt <= new Date()) {
      await this.usersService.removeRefreshToken(userId);
      throw new BadRequestException('Refresh token истек');
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      storedRefreshToken.tokenHash,
    );

    if (!isMatch) {
      throw new BadRequestException('Неверный refresh token');
    }

    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.updateRefreshToken(
      user.id,
      refreshTokenHash,
      this.getRefreshTokenExpiresAt(),
    );

    return tokens;
  }

  async logout(userId: number) {
    await this.usersService.removeRefreshToken(userId);

    return { message: 'Пользователь вышел из системы' };
  }
}
