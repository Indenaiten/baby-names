export enum Gender {
  BOY = 'boy',
  GIRL = 'girl',
  UNISEX = 'unisex',
}

export interface BabyNameProps {
  id?: string;
  name: string;
  gender: Gender;
  proposedBy: string; // userId
  groupId: string;
  averageScore?: number;
  totalRatings?: number;
  createdAt?: Date;
}

export class BabyName {
  public readonly id: string;
  public readonly name: string;
  public readonly gender: Gender;
  public readonly proposedBy: string;
  public readonly groupId: string;
  public averageScore: number;
  public totalRatings: number;
  public readonly createdAt: Date;

  private constructor(props: BabyNameProps) {
    this.id = props.id || '';
    this.name = props.name;
    this.gender = props.gender;
    this.proposedBy = props.proposedBy;
    this.groupId = props.groupId;
    this.averageScore = props.averageScore || 0;
    this.totalRatings = props.totalRatings || 0;
    this.createdAt = props.createdAt || new Date();
  }

  public static create(props: BabyNameProps): BabyName {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (!Object.values(Gender).includes(props.gender)) {
      throw new Error('Invalid gender. Must be boy, girl, or unisex');
    }
    if (!props.proposedBy) {
      throw new Error('ProposedBy (userId) is required');
    }
    if (!props.groupId) {
      throw new Error('GroupId is required');
    }
    return new BabyName(props);
  }

  public updateScore(newAverage: number, newTotal: number): void {
    this.averageScore = Math.round(newAverage * 100) / 100;
    this.totalRatings = newTotal;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      proposedBy: this.proposedBy,
      groupId: this.groupId,
      averageScore: this.averageScore,
      totalRatings: this.totalRatings,
      createdAt: this.createdAt,
    };
  }
}
