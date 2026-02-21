import { Group } from '../../domain/entities/Group';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { MemberRole, MemberStatus } from '../../domain/entities/Group';

export interface CreateGroupDTO {
  name: string;
  ownerId: string;
}

export class CreateGroup {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(dto: CreateGroupDTO): Promise<Group> {
    return this.groupRepository.create(
      Group.create({
        name: dto.name,
        ownerId: dto.ownerId,
      })
    );
  }
}

export class GetUserGroups {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(userId: string): Promise<Group[]> {
    return this.groupRepository.findByUserId(userId);
  }
}

export class GetGroupById {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      throw new Error('You are not a member of this group');
    }
    return group;
  }
}

export class InviteToGroup {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, userId: string, inviterId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    if (!group.isGroupAdmin(inviterId)) {
      throw new Error('Only group admins can invite members');
    }
    const existing = group.members.find((m) => m.userId === userId);
    if (existing) {
      throw new Error('User is already a member or has a pending invitation');
    }
    const updated = await this.groupRepository.addMember(groupId, {
      userId,
      role: MemberRole.MEMBER,
      status: MemberStatus.INVITED,
    });
    if (!updated) throw new Error('Failed to add member');
    return updated;
  }
}

export class RequestJoinGroup {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const existing = group.members.find((m) => m.userId === userId);
    if (existing) {
      throw new Error('You are already a member or have a pending request');
    }
    const updated = await this.groupRepository.addMember(groupId, {
      userId,
      role: MemberRole.MEMBER,
      status: MemberStatus.PENDING,
    });
    if (!updated) throw new Error('Failed to request join');
    return updated;
  }
}

export class AcceptMember {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, userId: string, adminId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    if (!group.isGroupAdmin(adminId)) {
      throw new Error('Only group admins can accept members');
    }
    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      throw new Error('User has no pending request');
    }
    if (member.status === MemberStatus.ACTIVE) {
      throw new Error('User is already an active member');
    }
    const updated = await this.groupRepository.updateMember(groupId, userId, {
      status: MemberStatus.ACTIVE,
    });
    if (!updated) throw new Error('Failed to accept member');
    return updated;
  }
}

export class RemoveGroupMember {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, userId: string, adminId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new Error('Group not found');
    if (!group.isGroupAdmin(adminId)) throw new Error('Only group admins can remove members');
    if (userId === group.ownerId) throw new Error('Cannot remove the group owner');
    const updated = await this.groupRepository.removeMember(groupId, userId);
    if (!updated) throw new Error('Failed to remove member');
    return updated;
  }
}

export class RenameGroup {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, newName: string, userId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new Error('Group not found');
    if (!group.isOwner(userId)) throw new Error('Only the group owner can rename the group');
    if (!newName || newName.trim().length < 2) throw new Error('Group name must be at least 2 characters');
    const updated = await this.groupRepository.update(groupId, { name: newName.trim() } as any);
    if (!updated) throw new Error('Failed to rename group');
    return updated;
  }
}

export class CloseGroup {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, closed: boolean, userId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new Error('Group not found');
    if (!group.isOwner(userId)) throw new Error('Only the group owner can close/reopen the group');
    const updated = await this.groupRepository.update(groupId, { closed } as any);
    if (!updated) throw new Error('Failed to update group');
    return updated;
  }
}

export class DeleteGroup {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new Error('Group not found');
    if (!group.isOwner(userId)) throw new Error('Only the group owner can delete the group');
    const deleted = await this.groupRepository.delete(groupId);
    if (!deleted) throw new Error('Failed to delete group');
  }
}

