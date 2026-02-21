import { Comment } from '../../domain/entities/Comment';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';

export interface AddCommentDTO {
  nameId: string;
  userId: string;
  text: string;
  parentId?: string | null;
}

export class AddComment {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(dto: AddCommentDTO): Promise<Comment> {
    if (dto.parentId) {
      const parent = await this.commentRepository.findById(dto.parentId);
      if (!parent) throw new Error('Parent comment not found');
      if (parent.nameId !== dto.nameId) throw new Error('Parent comment belongs to a different name');
    }

    const comment = Comment.create({
      nameId: dto.nameId,
      userId: dto.userId,
      text: dto.text,
      parentId: dto.parentId || null,
    });

    return this.commentRepository.create(comment);
  }
}

export class GetCommentsByName {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(nameId: string): Promise<Comment[]> {
    return this.commentRepository.findByNameId(nameId);
  }
}
