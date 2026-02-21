export interface CommentProps {
  id?: string;
  nameId: string;
  userId: string;
  userName?: string;
  text: string;
  parentId?: string | null;
  createdAt?: Date;
}

export class Comment {
  public readonly id: string;
  public readonly nameId: string;
  public readonly userId: string;
  public readonly userName?: string;
  public readonly text: string;
  public readonly parentId: string | null;
  public readonly createdAt: Date;

  private constructor(props: CommentProps) {
    this.id = props.id || '';
    this.nameId = props.nameId;
    this.userId = props.userId;
    this.userName = props.userName;
    this.text = props.text;
    this.parentId = props.parentId || null;
    this.createdAt = props.createdAt || new Date();
  }

  public static create(props: CommentProps): Comment {
    if (!props.nameId) {
      throw new Error('Name ID is required');
    }
    if (!props.userId) {
      throw new Error('User ID is required');
    }
    if (!props.text || props.text.trim().length === 0) {
      throw new Error('Comment text is required');
    }
    return new Comment(props);
  }

  public isReply(): boolean {
    return this.parentId !== null;
  }

  public toJSON() {
    return {
      id: this.id,
      nameId: this.nameId,
      userId: this.userId,
      userName: this.userName,
      text: this.text,
      parentId: this.parentId,
      createdAt: this.createdAt,
    };
  }
}
