import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserModel } from '../database/models/UserModel';

export class MongoUserRepository implements IUserRepository {
  private toDomain(doc: any): User {
    return User.create({
      id: doc._id.toString(),
      username: doc.username,
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      passwordHash: doc.passwordHash,
      role: doc.role as UserRole,
      mustChangePassword: doc.mustChangePassword,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }


  async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    if (!doc) return null;
    return this.toDomain(doc);
  }


  async findAll(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const docs = await UserModel.find({ _id: { $in: ids } });
    return docs.map((doc) => this.toDomain(doc));
  }

  async search(query: string, limit: number = 10): Promise<User[]> {
    const regex = new RegExp(query, 'i');
    const docs = await UserModel.find({
      $or: [
        { username: regex },
        { firstName: regex },
        { lastName: regex },
      ],
    }).limit(limit);
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
    return this.toDomain(doc);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}
