import { Rating } from '../../domain/entities/Rating';
import { IRatingRepository } from '../../domain/repositories/IRatingRepository';
import { IBabyNameRepository } from '../../domain/repositories/IBabyNameRepository';

export interface RateNameDTO {
  nameId: string;
  userId: string;
  score: number;
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
    
    let rating: Rating;
    if (existingRating) {
      rating = await this.ratingRepository.update(existingRating.id, { score: dto.score });
    } else {
      const newRating = Rating.create({
        nameId: dto.nameId,
        userId: dto.userId,
        score: dto.score,
      });
      rating = await this.ratingRepository.create(newRating);
    }

    // Update average score on the name
    const { average, count } = await this.ratingRepository.getAverageScore(dto.nameId);
    await this.babyNameRepository.update(dto.nameId, {
      averageScore: average,
      totalRatings: count,
    } as any);

    return rating;
  }
}

export class DeleteRating {
  constructor(
    private ratingRepository: IRatingRepository,
    private babyNameRepository: IBabyNameRepository
  ) {}

  async execute(userId: string, nameId: string): Promise<void> {
    const existingRating = await this.ratingRepository.findByUserAndName(userId, nameId);
    if (!existingRating) throw new Error('Rating not found');

    await this.ratingRepository.delete(existingRating.id);

    // Update average score on the name
    const { average, count } = await this.ratingRepository.getAverageScore(nameId);
    await this.babyNameRepository.update(nameId, {
      averageScore: average,
      totalRatings: count,
    } as any);
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
