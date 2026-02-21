import { Rating } from '../../domain/entities/Rating';
import { IRatingRepository } from '../../domain/repositories/IRatingRepository';
import { IBabyNameRepository } from '../../domain/repositories/IBabyNameRepository';

export interface RateNameDTO {
  nameId: string;
  userId: string;
  score: number;
  comment?: string;
}

export class RateName {
  constructor(
    private ratingRepository: IRatingRepository,
    private babyNameRepository: IBabyNameRepository
  ) {}

  async execute(dto: RateNameDTO): Promise<Rating> {
    const name = await this.babyNameRepository.findById(dto.nameId);
    if (!name) throw new Error('Name not found');

    const existingRating = await this.ratingRepository.findByUserAndName(dto.userId, dto.nameId);
    if (existingRating) throw new Error('You have already rated this name');

    const rating = Rating.create({
      nameId: dto.nameId,
      userId: dto.userId,
      score: dto.score,
      comment: dto.comment || '',
    });

    const created = await this.ratingRepository.create(rating);

    // Update average score on the name
    const { average, count } = await this.ratingRepository.getAverageScore(dto.nameId);
    await this.babyNameRepository.update(dto.nameId, {
      averageScore: average,
      totalRatings: count,
    } as any);

    return created;
  }
}

export class GetRatingsByName {
  constructor(private ratingRepository: IRatingRepository) {}

  async execute(nameId: string): Promise<Rating[]> {
    return this.ratingRepository.findByNameId(nameId);
  }
}

export class GetUserRatingsInGroup {
  constructor(private ratingRepository: IRatingRepository) {}

  async execute(userId: string, groupId: string): Promise<Rating[]> {
    return this.ratingRepository.findByUserInGroup(userId, groupId);
  }
}
