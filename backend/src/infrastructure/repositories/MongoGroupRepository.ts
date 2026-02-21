import { Group, MemberRole, MemberStatus } from '../../domain/entities/Group';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { GroupModel } from '../database/models/GroupModel';

export class MongoGroupRepository implements IGroupRepository {
  private toDomain(doc: any): Group {
    return Group.create({
      id: doc._id.toString(),
      name: doc.name,
      ownerId: doc.ownerId.toString(),
      members: doc.members.map((m: any) => ({
        userId: m.userId.toString(),
        role: m.role as MemberRole,
        status: m.status as MemberStatus,
        joinedAt: m.joinedAt,
      })),
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<Group | null> {
    const doc = await GroupModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByUserId(userId: string): Promise<Group[]> {
    const docs = await GroupModel.find({ 'members.userId': userId });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findAll(): Promise<Group[]> {
    const docs = await GroupModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(group: Group): Promise<Group> {
    const doc = await GroupModel.create({
      name: group.name,
      ownerId: group.ownerId,
      members: group.members.map((m) => ({
        userId: m.userId,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
      })),
    });
    return this.toDomain(doc);
  }

  async update(id: string, data: Partial<Group>): Promise<Group | null> {
    const doc = await GroupModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await GroupModel.findByIdAndDelete(id);
    return result !== null;
  }

  async addMember(
    groupId: string,
    member: { userId: string; role: string; status: string }
  ): Promise<Group | null> {
    const doc = await GroupModel.findByIdAndUpdate(
      groupId,
      {
        $push: {
          members: {
            userId: member.userId,
            role: member.role,
            status: member.status,
            joinedAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async updateMember(
    groupId: string,
    userId: string,
    data: { role?: string; status?: string }
  ): Promise<Group | null> {
    const update: any = {};
    if (data.role) update['members.$.role'] = data.role;
    if (data.status) update['members.$.status'] = data.status;

    const doc = await GroupModel.findOneAndUpdate(
      { _id: groupId, 'members.userId': userId },
      { $set: update },
      { new: true }
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async removeMember(groupId: string, userId: string): Promise<Group | null> {
    const doc = await GroupModel.findByIdAndUpdate(
      groupId,
      { $pull: { members: { userId } } },
      { new: true }
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }
}
