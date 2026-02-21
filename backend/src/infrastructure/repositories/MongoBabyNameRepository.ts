import { BabyName, Gender } from '../../domain/entities/BabyName';
import { IBabyNameRepository } from '../../domain/repositories/IBabyNameRepository';
import { BabyNameModel } from '../database/models/BabyNameModel';
import { RatingModel } from '../database/models/RatingModel';

export class MongoBabyNameRepository implements IBabyNameRepository {
  private toDomain(doc: any): BabyName {
    return BabyName.create({
      id: doc._id.toString(),
      name: doc.name,
      gender: doc.gender as Gender,
      proposedBy: doc.proposedBy.toString(),
      groupId: doc.groupId.toString(),
      averageScore: doc.averageScore,
      totalRatings: doc.totalRatings,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<BabyName | null> {
    const doc = await BabyNameModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByGroupId(groupId: string): Promise<BabyName[]> {
    const docs = await BabyNameModel.find({ groupId }).sort({ averageScore: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByGroupIdAndGender(groupId: string, gender: string): Promise<BabyName[]> {
    const docs = await BabyNameModel.find({ groupId, gender }).sort({ averageScore: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByProposedBy(userId: string, groupId: string): Promise<BabyName[]> {
    const docs = await BabyNameModel.find({ proposedBy: userId, groupId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findUnratedByUser(userId: string, groupId: string): Promise<BabyName[]> {
    const ratedNameIds = await RatingModel.find({ userId }).distinct('nameId');
    const docs = await BabyNameModel.find({
      groupId,
      _id: { $nin: ratedNameIds },
    }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(babyName: BabyName): Promise<BabyName> {
    const doc = await BabyNameModel.create({
      name: babyName.name,
      gender: babyName.gender,
      proposedBy: babyName.proposedBy,
      groupId: babyName.groupId,
    });
    return this.toDomain(doc);
  }

  async update(id: string, data: Partial<BabyName>): Promise<BabyName | null> {
    const doc = await BabyNameModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await BabyNameModel.findByIdAndDelete(id);
    return result !== null;
  }

  async existsByNameAndGroup(name: string, groupId: string): Promise<boolean> {
    const doc = await BabyNameModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      groupId,
    });
    return doc !== null;
  }
}
