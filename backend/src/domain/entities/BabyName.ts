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
  proposerName?: string;
  groupId: string;
  averageScore?: number;
  totalRatings?: number;
  description?: string;
  decisions?: BabyNameDecision[];
  isWinner?: boolean;
  createdAt?: Date;
}

export interface BabyNameDecision {
  userId: string;
  type: 'like' | 'dislike';
  createdAt: Date;
}

export class BabyName {
  public readonly id: string;
  public readonly name: string;
  public readonly gender: Gender;
  public readonly proposedBy: string;
  public readonly proposerName?: string;
  public readonly groupId: string;
  public averageScore: number;
  public totalRatings: number;
  public readonly description?: string;
  public decisions: BabyNameDecision[];
  public isWinner: boolean;
  public readonly createdAt: Date;

  private constructor(props: BabyNameProps) {
    this.id = props.id || '';
    this.name = props.name;
    this.gender = props.gender;
    this.proposedBy = props.proposedBy;
    this.proposerName = props.proposerName;
    this.groupId = props.groupId;
    this.averageScore = props.averageScore || 0;
    this.totalRatings = props.totalRatings || 0;
    this.description = props.description;
    this.decisions = props.decisions || [];
    this.isWinner = props.isWinner || false;
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
      proposerName: this.proposerName,
      groupId: this.groupId,
      averageScore: this.averageScore,
      totalRatings: this.totalRatings,
      description: this.description,
      decisions: this.decisions,
      isWinner: this.isWinner,
      createdAt: this.createdAt,
    };
  }
}
