export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INVITED = 'invited',
}

export interface GroupMember {
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
}

export interface GroupProps {
  id?: string;
  name: string;
  ownerId: string;
  members?: GroupMember[];
  createdAt?: Date;
}

export class Group {
  public readonly id: string;
  public readonly name: string;
  public readonly ownerId: string;
  public readonly members: GroupMember[];
  public readonly createdAt: Date;

  private constructor(props: GroupProps) {
    this.id = props.id || '';
    this.name = props.name;
    this.ownerId = props.ownerId;
    this.members = props.members || [
      {
        userId: props.ownerId,
        role: MemberRole.ADMIN,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    ];
    this.createdAt = props.createdAt || new Date();
  }

  public static create(props: GroupProps): Group {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Group name must be at least 2 characters long');
    }
    if (!props.ownerId) {
      throw new Error('Owner ID is required');
    }
    return new Group(props);
  }

  public isMember(userId: string): boolean {
    return this.members.some(
      (m) => m.userId === userId && m.status === MemberStatus.ACTIVE
    );
  }

  public isGroupAdmin(userId: string): boolean {
    return this.members.some(
      (m) =>
        m.userId === userId &&
        m.role === MemberRole.ADMIN &&
        m.status === MemberStatus.ACTIVE
    );
  }

  public hasPendingRequest(userId: string): boolean {
    return this.members.some(
      (m) => m.userId === userId && m.status === MemberStatus.PENDING
    );
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      members: this.members,
      createdAt: this.createdAt,
    };
  }
}
