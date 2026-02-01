'use strict';
import process from 'process';

var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = __importDefault(require('mongoose'));
const dotenv_1 = __importDefault(require('dotenv'));
const Profile_1 = __importDefault(require('../models/Profile'));
const logger_1 = __importDefault(require('../utils/logger'));
// Load environment variables
dotenv_1.default.config();
async function migrateSkills() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }
  await mongoose_1.default.connect(uri);
  logger_1.default.info('✅ Connected to MongoDB');
  // Only find documents where skills are still string arrays
  const profiles = await Profile_1.default.find({ 'skills.0': { $type: 'string' } });
  if (profiles.length === 0) {
    logger_1.default.info('✅ No documents to migrate');
    process.exit(0);
  }
  logger_1.default.info(`Found ${profiles.length} profiles to migrate...\n`);
  for (const profile of profiles) {
    const oldSkills = profile.skills;
    // 💡 Convert string skills → full skill objects
    const newSkills = oldSkills.map((s) => ({
      name: String(s).trim(),
      rating: 5,
      yearsOfExperience: 1,
    }));
    // ✅ Assign new skills array to profile
    profile.skills = newSkills;
    try {
      await profile.save();
      logger_1.default.info(`✅ Migrated profile: ${profile.name}`);
    } catch (err) {
      logger_1.default.error(`❌ Error migrating ${profile.name}:`, err);
    }
  }
  logger_1.default.error('\n🎉 Migration complete.');
  process.exit(0);
}
migrateSkills().catch((err) => {
  logger_1.default.error('❌ Migration failed:', err);
  process.exit(1);
});
