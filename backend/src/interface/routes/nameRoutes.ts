import { Router, Response } from 'express';
import {
  ProposeName,
  GetNamesByGroup,
  GetNamesByUser,
  GetUnratedNames,
  DeleteName,
  ExportNames,
} from '../../application/use-cases/NameUseCases';
import { RateName, GetRatingsByName, GetUserRatingsInGroup, DeleteRating } from '../../application/use-cases/RatingUseCases';
import { AddComment, GetCommentsByName } from '../../application/use-cases/CommentUseCases';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { MongoBabyNameRepository } from '../../infrastructure/repositories/MongoBabyNameRepository';
import { MongoGroupRepository } from '../../infrastructure/repositories/MongoGroupRepository';
import { MongoRatingRepository } from '../../infrastructure/repositories/MongoRatingRepository';
import { MongoCommentRepository } from '../../infrastructure/repositories/MongoCommentRepository';
import { Gender } from '../../domain/entities/BabyName';

const router = Router();
const babyNameRepository = new MongoBabyNameRepository();
const groupRepository = new MongoGroupRepository();
const ratingRepository = new MongoRatingRepository();
const commentRepository = new MongoCommentRepository();

// POST /api/groups/:gid/names
router.post('/groups/:gid/names', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const group = await groupRepository.findById(req.params.gid);
    if (group?.closed) return res.status(403).json({ error: 'Este grupo está cerrado. No se pueden proponer nombres.' });
    const proposeName = new ProposeName(babyNameRepository, groupRepository);
    const name = await proposeName.execute({
      name: req.body.name,
      gender: req.body.gender as Gender,
      groupId: req.params.gid,
      proposedBy: req.userId!,
    });
    res.status(201).json(name.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/groups/:gid/names
router.get('/groups/:gid/names', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getNames = new GetNamesByGroup(babyNameRepository);
    const names = await getNames.execute(req.params.gid, req.query.gender as string | undefined);
    res.json(names.map((n) => n.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/groups/:gid/names/mine
router.get('/groups/:gid/names/mine', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getNames = new GetNamesByUser(babyNameRepository);
    const names = await getNames.execute(req.userId!, req.params.gid);
    res.json(names.map((n) => n.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/groups/:gid/names/unrated
router.get('/groups/:gid/names/unrated', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getUnrated = new GetUnratedNames(babyNameRepository);
    const names = await getUnrated.execute(req.userId!, req.params.gid);
    res.json(names.map((n) => n.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/names/:id
router.delete('/names/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleteName = new DeleteName(babyNameRepository, groupRepository);
    await deleteName.execute(req.params.id, req.userId!, req.userRole);
    res.json({ message: 'Name deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/groups/:gid/export
router.get('/groups/:gid/export', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exportNames = new ExportNames(babyNameRepository, groupRepository);
    const names = await exportNames.execute(req.params.gid, req.userId!, req.userRole);
    res.json(names.map((n: any) => n.toJSON()));
  } catch (error: any) {
    const status = error.message.includes('Only') ? 403 : 400;
    res.status(status).json({ error: error.message });
  }
});

// POST /api/names/:id/rate
router.post('/names/:id/rate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if group is closed
    const babyName = await babyNameRepository.findById(req.params.id);
    if (babyName) {
      const group = await groupRepository.findById(babyName.groupId);
      if (group?.closed) return res.status(403).json({ error: 'Este grupo está cerrado. No se pueden emitir votos.' });
    }
    const rateName = new RateName(ratingRepository, babyNameRepository);
    const rating = await rateName.execute({
      nameId: req.params.id,
      userId: req.userId!,
      score: req.body.score,
    });
    res.status(201).json(rating.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/names/:id/ratings
router.get('/names/:id/ratings', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getRatings = new GetRatingsByName(ratingRepository);
    const ratings = await getRatings.execute(req.params.id);
    res.json(ratings.map((r) => r.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/groups/:gid/ratings/mine
router.get('/groups/:gid/ratings/mine', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getUserRatings = new GetUserRatingsInGroup(ratingRepository);
    const ratings = await getUserRatings.execute(req.userId!, req.params.gid);
    res.json(ratings.map((r) => r.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/names/:id/rate
router.delete('/names/:id/rate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if group is closed
    const babyName = await babyNameRepository.findById(req.params.id);
    if (babyName) {
      const group = await groupRepository.findById(babyName.groupId);
      if (group?.closed) return res.status(403).json({ error: 'Este grupo está cerrado. No se pueden eliminar votos.' });
    }
    const deleteRating = new DeleteRating(ratingRepository, babyNameRepository);
    await deleteRating.execute(req.userId!, req.params.id);
    res.json({ message: 'Rating deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/names/:id/comments
router.get('/names/:id/comments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getComments = new GetCommentsByName(commentRepository);
    const comments = await getComments.execute(req.params.id);
    res.json(comments.map((c) => c.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/names/:id/comments
router.post('/names/:id/comments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if group is closed
    const nameForComment = await babyNameRepository.findById(req.params.id);
    if (nameForComment) {
      const group = await groupRepository.findById(nameForComment.groupId);
      if (group?.closed) return res.status(403).json({ error: 'Este grupo está cerrado. No se pueden añadir comentarios.' });
    }
    const addComment = new AddComment(commentRepository);
    const comment = await addComment.execute({
      nameId: req.params.id,
      userId: req.userId!,
      text: req.body.text,
      parentId: req.body.parentId || null,
    });
    res.status(201).json(comment.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
