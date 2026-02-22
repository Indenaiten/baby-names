import { BabyName, Gender } from '../../domain/entities/BabyName';
import { IBabyNameRepository } from '../../domain/repositories/IBabyNameRepository';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';

export interface ProposeNameDTO {
  name: string;
  gender: Gender;
  groupId: string;
  proposedBy: string;
  description?: string;
}

export class ProposeName {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) { }

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
      description: dto.description,
    });

    return this.babyNameRepository.create(babyName);
  }
}

export class GetNamesByGroup {
  constructor(private babyNameRepository: IBabyNameRepository) { }

  async execute(groupId: string, gender?: string): Promise<BabyName[]> {
    if (gender) {
      return this.babyNameRepository.findByGroupIdAndGender(groupId, gender);
    }
    return this.babyNameRepository.findByGroupId(groupId);
  }
}

export class GetNamesByUser {
  constructor(private babyNameRepository: IBabyNameRepository) { }

  async execute(userId: string, groupId: string): Promise<BabyName[]> {
    return this.babyNameRepository.findByProposedBy(userId, groupId);
  }
}

export class GetUnratedNames {
  constructor(private babyNameRepository: IBabyNameRepository) { }

  async execute(userId: string, groupId: string): Promise<BabyName[]> {
    return this.babyNameRepository.findUnratedByUser(userId, groupId);
  }
}

export class DeleteName {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) { }

  async execute(nameId: string, userId: string, userRole?: string): Promise<void> {
    const name = await this.babyNameRepository.findById(nameId);
    if (!name) throw new Error('Name not found');

    const group = await this.groupRepository.findById(name.groupId);
    if (!group) throw new Error('Group not found');

    const isRoot = userRole === 'root';
    const isOwner = group.ownerId === userId;
    const isInvolved = group.isInvolvedMember(userId);

    if (!isRoot && !isOwner && !isInvolved) {
      throw new Error('Only owners or involved members can delete names');
    }

    await this.babyNameRepository.delete(nameId);
  }
}

export class ExportNames {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) { }

  async execute(groupId: string, userId: string, userRole?: string): Promise<BabyName[]> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new Error('Group not found');

    const isRoot = userRole === 'root';
    const isOwner = group.ownerId === userId;

    if (!isRoot && !isOwner) {
      throw new Error('Only the group owner or root user can export names');
    }

    return this.babyNameRepository.findByGroupId(groupId);
  }
}

export class CastDecision {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) { }

  async execute(nameId: string, userId: string, type: 'like' | 'dislike' | null, userRole?: string): Promise<BabyName> {
    const name = await this.babyNameRepository.findById(nameId);
    if (!name) throw new Error('Name not found');

    const group = await this.groupRepository.findById(name.groupId);
    if (!group) throw new Error('Group not found');

    if (userRole !== 'root' && !group.isMember(userId)) {
      throw new Error('Only group members can cast decisions');
    }

    let decisions = [...name.decisions];
    const existingIndex = decisions.findIndex((d) => String(d.userId) === String(userId));

    if (type === null) {
      if (existingIndex !== -1) decisions.splice(existingIndex, 1);
    } else {
      if (existingIndex !== -1) {
        decisions[existingIndex] = { userId, type, createdAt: new Date() };
      } else {
        decisions.push({ userId, type, createdAt: new Date() });
      }
    }

    const updated = await this.babyNameRepository.update(nameId, { decisions });
    if (!updated) throw new Error('Failed to update decision');
    return updated;
  }
}

export class SetWinner {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) { }

  async execute(nameId: string, userId: string, isWinner: boolean, userRole?: string): Promise<BabyName> {
    const name = await this.babyNameRepository.findById(nameId);
    if (!name) throw new Error('Name not found');

    const group = await this.groupRepository.findById(name.groupId);
    if (!group) throw new Error('Group not found');

    if (userRole !== 'root' && !group.isInvolvedMember(userId)) {
      throw new Error('Only involved members can set the winning name');
    }

    // Unset other winners in the same group?
    // Usually there's only one winner. Let's unset others if this one is being set.
    if (isWinner) {
      const allNames = await this.babyNameRepository.findByGroupId(name.groupId);
      for (const n of allNames) {
        if (n.isWinner && n.id !== nameId) {
          await this.babyNameRepository.update(n.id, { isWinner: false });
        }
      }
    }

    const updated = await this.babyNameRepository.update(nameId, { isWinner });
    if (!updated) throw new Error('Failed to update winner status');
    return updated;
  }
}

export class UpdateNameDescription {
  constructor(
    private babyNameRepository: IBabyNameRepository,
    private groupRepository: IGroupRepository
  ) { }

  async execute(nameId: string, userId: string, description: string, userRole?: string): Promise<BabyName> {
    const name = await this.babyNameRepository.findById(nameId);
    if (!name) throw new Error('Name not found');

    const group = await this.groupRepository.findById(name.groupId);
    if (!group) throw new Error('Group not found');

    // Only the proposer can update the description
    if (userRole !== 'root' && name.proposedBy !== userId) {
      throw new Error('Only the proposer can update the description');
    }

    // Allow empty description (to remove it)
    const trimmedDescription = description.trim();
    const updated = await this.babyNameRepository.update(nameId, {
      description: trimmedDescription || undefined
    });
    if (!updated) throw new Error('Failed to update description');
    return updated;
  }
}
