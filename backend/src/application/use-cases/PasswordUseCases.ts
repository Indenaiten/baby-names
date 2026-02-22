import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AuthService } from '../../infrastructure/auth/AuthService';
import { UserRole } from '../../domain/entities/User';

export class ResetPassword {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, newPassword: string, requesterRole: UserRole): Promise<void> {
    if (requesterRole !== UserRole.ROOT && requesterRole !== UserRole.ADMIN) {
      throw new Error('Only admins can reset passwords');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.role === UserRole.ROOT && requesterRole !== UserRole.ROOT) {
      throw new Error('Only root can reset root password');
    }

    const passwordHash = await AuthService.hashPassword(newPassword);
    await this.userRepository.update(userId, { 
      passwordHash, 
      mustChangePassword: true 
    } as any);
  }
}

export class ChangePassword {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, currentPassword: string | undefined, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // Only check current password if it's NOT a mandatory change
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        throw new Error('Current password is required');
      }
      const isValid = await AuthService.comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new Error('Current password incorrect');
      }
    }

    const passwordHash = await AuthService.hashPassword(newPassword);
    await this.userRepository.update(userId, { 
      passwordHash, 
      mustChangePassword: false 
    } as any);
  }
}
