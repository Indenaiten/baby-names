import { BabyName } from '../entities/BabyName';

export interface IBabyNameRepository {
  findById(id: string): Promise<BabyName | null>;
  findByGroupId(groupId: string): Promise<BabyName[]>;
  findByGroupIdAndGender(groupId: string, gender: string): Promise<BabyName[]>;
  findByProposedBy(userId: string, groupId: string): Promise<BabyName[]>;
  findUnratedByUser(userId: string, groupId: string): Promise<BabyName[]>;
  create(babyName: BabyName): Promise<BabyName>;
  update(id: string, data: Partial<BabyName>): Promise<BabyName | null>;
  delete(id: string): Promise<boolean>;
  existsByNameAndGroup(name: string, groupId: string): Promise<boolean>;
}
