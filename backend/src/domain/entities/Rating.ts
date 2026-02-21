export interface RatingProps {
  id?: string;
  nameId: string;
  userId: string;
  score: number;
  comment?: string;
  createdAt?: Date;
}

export class Rating {
  public readonly id: string;
  public readonly nameId: string;
  public readonly userId: string;
  public readonly score: number;
  public readonly comment: string;
  public readonly createdAt: Date;

  private constructor(props: RatingProps) {
    this.id = props.id || '';
    this.nameId = props.nameId;
    this.userId = props.userId;
    this.score = props.score;
    this.comment = props.comment || '';
    this.createdAt = props.createdAt || new Date();
  }

  public static create(props: RatingProps): Rating {
    if (!props.nameId) {
      throw new Error('Name ID is required');
    }
    if (!props.userId) {
      throw new Error('User ID is required');
    }
    if (props.score < 1 || props.score > 10 || !Number.isInteger(props.score)) {
      throw new Error('Score must be an integer between 1 and 10');
    }
    return new Rating(props);
  }

  public toJSON() {
    return {
      id: this.id,
      nameId: this.nameId,
      userId: this.userId,
      score: this.score,
      comment: this.comment,
      createdAt: this.createdAt,
    };
  }
}
