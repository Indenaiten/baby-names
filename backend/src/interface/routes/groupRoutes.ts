import { Router, Response } from 'express';
import {
  CreateGroup,
  GetUserGroups,
  GetGroupById,
  InviteToGroup,
  RequestJoinGroup,
  AcceptMember,
  RemoveGroupMember,
  RenameGroup,
  CloseGroup,
  DeleteGroup,
  RespondToInvitation,
  LeaveGroup,
} from '../../application/use-cases/GroupUseCases';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { MongoGroupRepository } from '../../infrastructure/repositories/MongoGroupRepository';

const router = Router();
const groupRepository = new MongoGroupRepository();

// POST /api/groups
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const createGroup = new CreateGroup(groupRepository);
    const group = await createGroup.execute({
      name: req.body.name,
      ownerId: req.userId!,
    });
    res.status(201).json(group.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/groups
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getUserGroups = new GetUserGroups(groupRepository);
    const groups = await getUserGroups.execute(req.userId!);
    res.json(groups.map((g) => g.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/groups/:id
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getGroup = new GetGroupById(groupRepository);
    const group = await getGroup.execute(req.params.id, req.userId!);
    res.json(group.toJSON());
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// PUT /api/groups/:id/rename
router.put('/:id/rename', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rename = new RenameGroup(groupRepository);
    const group = await rename.execute(req.params.id, req.body.name, req.userId!);
    res.json(group.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/groups/:id/close
router.put('/:id/close', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const close = new CloseGroup(groupRepository);
    const closed = req.body.closed !== undefined ? req.body.closed : true;
    const group = await close.execute(req.params.id, closed, req.userId!);
    res.json(group.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/groups/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const del = new DeleteGroup(groupRepository);
    await del.execute(req.params.id, req.userId!);
    res.json({ message: 'Group deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/groups/:id/invite
router.post('/:id/invite', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invite = new InviteToGroup(groupRepository);
    const group = await invite.execute(req.params.id, req.body.userId, req.userId!);
    res.json(group.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/groups/:id/join
router.post('/:id/join', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const join = new RequestJoinGroup(groupRepository);
    const group = await join.execute(req.params.id, req.userId!);
    res.json(group.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/groups/:id/members/:uid
router.put('/:id/members/:uid', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const action = req.body.action; // 'accept' or 'remove'
    if (action === 'accept') {
      const accept = new AcceptMember(groupRepository);
      const group = await accept.execute(req.params.id, req.params.uid, req.userId!);
      res.json(group.toJSON());
    } else if (action === 'remove') {
      const remove = new RemoveGroupMember(groupRepository);
      const group = await remove.execute(req.params.id, req.params.uid, req.userId!);
      res.json(group.toJSON());
    } else {
      res.status(400).json({ error: 'Invalid action. Use "accept" or "remove".' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/groups/:id/respond — user accepts or rejects their own invitation
router.post('/:id/respond', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const action = req.body.action;
    if (action !== 'accept' && action !== 'reject') {
      return res.status(400).json({ error: 'Invalid action. Use "accept" or "reject".' });
    }
    const respond = new RespondToInvitation(groupRepository);
    const group = await respond.execute(req.params.id, req.userId!, action);
    res.json(group ? group.toJSON() : { message: 'Invitation rejected' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/groups/:id/leave — user leaves a group
router.post('/:id/leave', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leave = new LeaveGroup(groupRepository);
    await leave.execute(req.params.id, req.userId!);
    res.json({ message: 'Left group successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
