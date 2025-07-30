import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Profile from '../src/models/Profile';

// Load environment variables
dotenv.config();

async function migrateSkills() {
  const uri = process.env.MONGODB_URI!;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // Only find documents where skills are still string arrays
  const profiles = await Profile.find({ 'skills.0': { $type: 'string' } });

  if (profiles.length === 0) {
    console.log('✅ No documents to migrate');
    process.exit(0);
  }

  console.log(`Found ${profiles.length} profiles to migrate...\n`);

  for (const profile of profiles) {
    const oldSkills = profile.skills as unknown as string[];

    // 💡 Convert string skills → full skill objects
    const newSkills = oldSkills.map(s => ({
      name: String(s).trim(),
      rating: 5,
      yearsOfExperience: 1,
    }));

    // ✅ Assign new skills array to profile
    profile.skills = newSkills;

    try {
      await profile.save();
      console.log(`✅ Migrated profile: ${profile.name}`);
    } catch (err) {
      console.error(`❌ Error migrating ${profile.name}:`, err);
    }
  }

  console.log('\n🎉 Migration complete.');
  process.exit(0);
}

migrateSkills().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
