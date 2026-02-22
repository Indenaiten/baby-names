import { Group } from '../entities/Group';

export interface IGroupRepository {
  findById(id: string): Promise<Group | null>;
  findByUserId(userId: string): Promise<Group[]>;
  findAll(): Promise<Group[]>;
  create(group: Group): Promise<Group>;
  update(id: string, data: Partial<Group>): Promise<Group | null>;
  delete(id: string): Promise<boolean>;
  addMember(groupId: string, member: { userId: string; role: string; status: string }): Promise<Group | null>;
  updateMember(groupId: string, userId: string, data: { role?: string; status?: string; isInvolved?: boolean }): Promise<Group | null>;
  removeMember(groupId: string, userId: string): Promise<Group | null>;
}
