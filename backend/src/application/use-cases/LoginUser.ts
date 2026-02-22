import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AuthService } from '../../infrastructure/auth/AuthService';

export interface LoginDTO {
  identifier: string; // username
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    mustChangePassword: boolean;
  };
}

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: LoginDTO): Promise<LoginResult> {
    const normalizedIdentifier = dto.identifier.trim().toLowerCase();
    const user = await this.userRepository.findByUsername(normalizedIdentifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await AuthService.comparePassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = AuthService.generateToken({
      userId: user.id,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}
