import { Rating } from '../entities/Rating';

export interface IRatingRepository {
  findById(id: string): Promise<Rating | null>;
  findByNameId(nameId: string): Promise<Rating[]>;
  findByUserId(userId: string): Promise<Rating[]>;
  findByUserAndName(userId: string, nameId: string): Promise<Rating | null>;
  findByUserInGroup(userId: string, groupId: string): Promise<Rating[]>;
  create(rating: Rating): Promise<Rating>;
  getAverageScore(nameId: string): Promise<{ average: number; count: number }>;
}
