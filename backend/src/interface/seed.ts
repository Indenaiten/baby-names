import { UserModel } from '../infrastructure/database/models/UserModel';
import { AuthService } from '../infrastructure/auth/AuthService';

export async function seedRootUser(): Promise<void> {
  const rootUsername = process.env.ROOT_USERNAME || 'root';
  const rootPassword = process.env.ROOT_PASSWORD || 'root1234';

  const existing = await UserModel.findOne({ role: 'root' });
  if (existing) {
    console.log('✅ Root user already exists');
    return;
  }

  const passwordHash = await AuthService.hashPassword(rootPassword);
  await UserModel.create({
    username: rootUsername,
    passwordHash,
    role: 'root',
  });

  console.log(`🌱 Root user created: ${rootUsername}`);
}
