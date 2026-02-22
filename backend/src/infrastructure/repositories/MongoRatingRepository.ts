import { Rating } from '../../domain/entities/Rating';
import { IRatingRepository } from '../../domain/repositories/IRatingRepository';
import { RatingModel } from '../database/models/RatingModel';

export class MongoRatingRepository implements IRatingRepository {
  private toDomain(doc: any): Rating {
    const userObj = typeof doc.userId === 'object' && doc.userId._id 
      ? doc.userId 
      : { _id: doc.userId };

    return Rating.create({
      id: doc._id.toString(),
      nameId: doc.nameId.toString(),
      userId: userObj._id.toString(),
      userName: userObj.username,
      score: doc.score,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<Rating | null> {
    const doc = await RatingModel.findById(id).populate('userId', 'username');
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByNameId(nameId: string): Promise<Rating[]> {
    const docs = await RatingModel.find({ nameId }).sort({ createdAt: -1 }).populate('userId', 'username');
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByUserId(userId: string): Promise<Rating[]> {
    const docs = await RatingModel.find({ userId }).sort({ createdAt: -1 }).populate('userId', 'username');
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByUserAndName(userId: string, nameId: string): Promise<Rating | null> {
    const doc = await RatingModel.findOne({ userId, nameId }).populate('userId', 'username');
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByUserInGroup(userId: string, groupId: string): Promise<Rating[]> {
    const docs = await RatingModel.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      {
        $lookup: {
          from: 'babynames',
          localField: 'nameId',
          foreignField: '_id',
          as: 'name',
        },
      },
      { $unwind: '$name' },
      { $match: { 'name.groupId': require('mongoose').Types.ObjectId.createFromHexString(groupId) } },
      { $sort: { createdAt: -1 } },
    ]);

    return docs.map((doc: any) =>
      Rating.create({
        id: doc._id.toString(),
        nameId: doc.nameId.toString(),
        userId: doc.userId.toString(),
        score: doc.score,
        createdAt: doc.createdAt,
      })
    );
  }

  async create(rating: Rating): Promise<Rating> {
    const doc = await RatingModel.create({
      nameId: rating.nameId,
      userId: rating.userId,
      score: rating.score,
    });
    // Populate user info after creation
    await doc.populate('userId', 'username');
    return this.toDomain(doc);
  }

  async update(id: string, rating: Partial<Rating>): Promise<Rating> {
    const doc = await RatingModel.findByIdAndUpdate(id, { score: rating.score }, { new: true }).populate('userId', 'username');
    if (!doc) throw new Error('Rating not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await RatingModel.findByIdAndDelete(id);
  }

  async getAverageScore(nameId: string): Promise<{ average: number; count: number }> {
    const result = await RatingModel.aggregate([
      { $match: { nameId: require('mongoose').Types.ObjectId.createFromHexString(nameId) } },
      {
        $group: {
          _id: null,
          average: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { average: 0, count: 0 };
    }

    return {
      average: Math.round(result[0].average * 100) / 100,
      count: result[0].count,
    };
  }
}
