import { BabyName, Gender } from '../../domain/entities/BabyName';
import { IBabyNameRepository } from '../../domain/repositories/IBabyNameRepository';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';

export interface ProposeNameDTO {
  name: string;
  gender: Gender;
  groupId: string;
  proposedBy: string;
}

export class ProposeName {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) {}

  async execute(dto: ProposeNameDTO): Promise<BabyName> {
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group) throw new Error('Group not found');
    if (!group.isMember(dto.proposedBy)) throw new Error('You are not a member of this group');

    const exists = await this.babyNameRepository.existsByNameAndGroup(dto.name, dto.groupId);
    if (exists) throw new Error('This name has already been proposed in this group');

    const babyName = BabyName.create({
      name: dto.name.trim(),
      gender: dto.gender,
      proposedBy: dto.proposedBy,
      groupId: dto.groupId,
    });

    return this.babyNameRepository.create(babyName);
  }
}

export class GetNamesByGroup {
  constructor(private babyNameRepository: IBabyNameRepository) {}

  async execute(groupId: string, gender?: string): Promise<BabyName[]> {
    if (gender) {
      return this.babyNameRepository.findByGroupIdAndGender(groupId, gender);
    }
    return this.babyNameRepository.findByGroupId(groupId);
  }
}

export class GetNamesByUser {
  constructor(private babyNameRepository: IBabyNameRepository) {}

  async execute(userId: string, groupId: string): Promise<BabyName[]> {
    return this.babyNameRepository.findByProposedBy(userId, groupId);
  }
}

export class GetUnratedNames {
  constructor(private babyNameRepository: IBabyNameRepository) {}

  async execute(userId: string, groupId: string): Promise<BabyName[]> {
    return this.babyNameRepository.findUnratedByUser(userId, groupId);
  }
}

export class DeleteName {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) {}

  async execute(nameId: string, userId: string): Promise<void> {
    const name = await this.babyNameRepository.findById(nameId);
    if (!name) throw new Error('Name not found');

    const group = await this.groupRepository.findById(name.groupId);
    if (!group) throw new Error('Group not found');

    const isGroupAdmin = group.isGroupAdmin(userId);
    const isProposer = name.proposedBy === userId;

    if (!isGroupAdmin && !isProposer) {
      throw new Error('Only group admins or the proposer can delete names');
    }

    await this.babyNameRepository.delete(nameId);
  }
}
