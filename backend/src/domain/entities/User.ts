export enum UserRole {
  ROOT = 'root',
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserProps {
  id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id || '';
    this.username = props.username;
    this.firstName = props.firstName || '';
    this.lastName = props.lastName || '';
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: UserProps): User {
    if (!props.username || props.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    if (!props.passwordHash) {
      throw new Error('Password hash is required');
    }
    if (!Object.values(UserRole).includes(props.role)) {
      throw new Error('Invalid user role');
    }
    return new User(props);
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.ROOT;
  }

  public isRoot(): boolean {
    return this.role === UserRole.ROOT;
  }

  public toJSON() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
