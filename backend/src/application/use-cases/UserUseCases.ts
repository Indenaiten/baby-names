import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRole } from '../../domain/entities/User';
import { User } from '../../domain/entities/User';

export class GetAllUsers {
  constructor(private userRepository: IUserRepository) { }

  async execute(requesterRole: UserRole): Promise<User[]> {
    if (requesterRole !== UserRole.ROOT && requesterRole !== UserRole.ADMIN) {
      throw new Error('Only admins can list users');
    }
    return this.userRepository.findAll();
  }
}

export class DeleteUser {
  constructor(private userRepository: IUserRepository) { }

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
  constructor(private userRepository: IUserRepository) { }

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}

export class UpdateUserRole {
  constructor(private userRepository: IUserRepository) { }

  async execute(targetUserId: string, newRole: UserRole, requesterId: string, requesterRole: UserRole): Promise<void> {
    if (requesterRole !== UserRole.ROOT && requesterRole !== UserRole.ADMIN) {
      throw new Error('Only admins can change user roles');
    }

    if (targetUserId.toString() === requesterId.toString()) {
      throw new Error('You cannot change your own role');
    }

    if (newRole === UserRole.ROOT) {
      throw new Error('Cannot assign root role');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) throw new Error('User not found');

    if (targetUser.role === UserRole.ROOT) {
      throw new Error('Cannot change root user role');
    }

    // Admins can change roles of anyone except root

    await this.userRepository.update(targetUserId, { role: newRole } as any);
  }
}

export class UpdateUser {
  constructor(private userRepository: IUserRepository) { }

  async execute(userId: string, data: { username?: string; firstName?: string; lastName?: string }, requesterRole: UserRole): Promise<User> {
    if (requesterRole !== UserRole.ROOT && requesterRole !== UserRole.ADMIN) {
      throw new Error('Only admins can update users');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // Protection: admins cannot update the root user
    if (user.role === UserRole.ROOT && requesterRole !== UserRole.ROOT) {
      throw new Error('Only root can update root user');
    }

    if (data.username) {
      const normalizedUsername = data.username.trim().toLowerCase();
      const existing = await this.userRepository.findByUsername(normalizedUsername);
      if (existing && existing.id.toString() !== userId.toString()) {
        throw new Error('Username already in use');
      }
      data.username = normalizedUsername;
    }

    // Relax first name validation: only throw if it's explicitly being cleared and it's a new requirement
    if (data.firstName !== undefined && data.firstName.trim().length === 0 && user.firstName.length > 0) {
      throw new Error('First name cannot be empty');
    }

    const updatedUser = await this.userRepository.update(userId, data as any);
    if (!updatedUser) throw new Error('Error updating user');

    return updatedUser;
  }
}
