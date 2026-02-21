import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserModel } from '../database/models/UserModel';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    if (!doc) return null;
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });
    if (!doc) return null;
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 });
    return docs.map((doc) =>
      User.create({
        id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role as UserRole,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })
    );
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    });
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) return null;
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}
