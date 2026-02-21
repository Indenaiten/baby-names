import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRole } from '../../domain/entities/User';
import { User } from '../../domain/entities/User';

export class GetAllUsers {
  constructor(private userRepository: IUserRepository) {}

  async execute(requesterRole: UserRole): Promise<User[]> {
    if (requesterRole !== UserRole.ROOT && requesterRole !== UserRole.ADMIN) {
      throw new Error('Only admins can list users');
    }
    return this.userRepository.findAll();
  }
}

export class DeleteUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, requesterRole: UserRole): Promise<void> {
    if (requesterRole !== UserRole.ROOT && requesterRole !== UserRole.ADMIN) {
      throw new Error('Only admins can delete users');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.role === UserRole.ROOT) {
      throw new Error('Cannot delete root user');
    }

    if (user.role === UserRole.ADMIN && requesterRole !== UserRole.ROOT) {
      throw new Error('Only root can delete admin users');
    }

    await this.userRepository.delete(userId);
  }
}

export class GetUserProfile {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}
