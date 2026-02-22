import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AuthService } from '../../infrastructure/auth/AuthService';

export interface RegisterUserDTO {
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: UserRole;
}

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDTO, requesterRole: UserRole): Promise<User> {
    // Only root can create admins, root/admin can create users
    if (dto.role === UserRole.ROOT) {
      throw new Error('Cannot create root users');
    }
    if (dto.role === UserRole.ADMIN && requesterRole !== UserRole.ROOT) {
      throw new Error('Only root can create admin users');
    }
    if (requesterRole === UserRole.USER) {
      throw new Error('Users cannot create other users');
    }


    const existingByUsername = await this.userRepository.findByUsername(dto.username);
    if (existingByUsername) {
      throw new Error('Username already in use');
    }

    const passwordHash = await AuthService.hashPassword(dto.password);

    const user = User.create({
      username: dto.username,
      firstName: dto.firstName || '',
      lastName: dto.lastName || '',
      passwordHash,
      role: dto.role,
      mustChangePassword: true,
    });

    return this.userRepository.create(user);
  }
}
