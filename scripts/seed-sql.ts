import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create test users
    const users = await Promise.all([
      client.query(`
        INSERT INTO users (id, fid, username, "displayName", "pfpUrl")
        VALUES (gen_random_uuid()::text, 1, 'alice', 'Alice Smith', 'https://picsum.photos/200/200?random=1')
        ON CONFLICT (fid) DO UPDATE SET
          username = EXCLUDED.username,
          "displayName" = EXCLUDED."displayName",
          "pfpUrl" = EXCLUDED."pfpUrl"
        RETURNING id, fid
      `),
      client.query(`
        INSERT INTO users (id, fid, username, "displayName", "pfpUrl")
        VALUES (gen_random_uuid()::text, 2, 'bob', 'Bob Johnson', 'https://picsum.photos/200/200?random=2')
        ON CONFLICT (fid) DO UPDATE SET
          username = EXCLUDED.username,
          "displayName" = EXCLUDED."displayName",
          "pfpUrl" = EXCLUDED."pfpUrl"
        RETURNING id, fid
      `),
      client.query(`
        INSERT INTO users (id, fid, username, "displayName", "pfpUrl")
        VALUES (gen_random_uuid()::text, 3, 'charlie', 'Charlie Brown', 'https://picsum.photos/200/200?random=3')
        ON CONFLICT (fid) DO UPDATE SET
          username = EXCLUDED.username,
          "displayName" = EXCLUDED."displayName",
          "pfpUrl" = EXCLUDED."pfpUrl"
        RETURNING id, fid
      `),
    ]);

    console.log(`✅ Created/updated ${users.length} users`);

    // Get user IDs
    const userResults = await client.query('SELECT id, fid FROM users ORDER BY fid');
    const userIds = userResults.rows;

    // Create sample markets
    const now = new Date();
    const markets = await Promise.all([
      client.query(`
        INSERT INTO markets (slug, question, description, "optionA", "optionB", "expiresAt", "creatorId")
        VALUES ('bitcoin-price-2024', 'Will Bitcoin reach $100,000 by end of 2024?', 'A prediction on Bitcoin''s price trajectory for 2024', 'Yes', 'No', $1, $2)
        ON CONFLICT (slug) DO UPDATE SET
          question = EXCLUDED.question,
          description = EXCLUDED.description
        RETURNING id, slug
      `, [new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), userIds[0].id]),
      
      client.query(`
        INSERT INTO markets (slug, question, description, "optionA", "optionB", "expiresAt", "creatorId")
        VALUES ('election-outcome-2024', 'Will the incumbent win the 2024 election?', 'Prediction on the outcome of the upcoming election', 'Yes', 'No', $1, $2)
        ON CONFLICT (slug) DO UPDATE SET
          question = EXCLUDED.question,
          description = EXCLUDED.description
        RETURNING id, slug
      `, [new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), userIds[1].id]),
      
      client.query(`
        INSERT INTO markets (slug, question, description, "optionA", "optionB", "expiresAt", "creatorId")
        VALUES ('ai-breakthrough-2024', 'Will AGI be achieved in 2024?', 'Prediction on artificial general intelligence breakthrough', 'Yes', 'No', $1, $2)
        ON CONFLICT (slug) DO UPDATE SET
          question = EXCLUDED.question,
          description = EXCLUDED.description
        RETURNING id, slug
      `, [new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), userIds[2].id]),
    ]);

    console.log(`✅ Created/updated ${markets.length} markets`);

    // Get market IDs
    const marketResults = await client.query('SELECT id, slug FROM markets ORDER BY "createdAt"');
    const marketIds = marketResults.rows;

    // Create sample predictions
    const predictions = await Promise.all([
      client.query(`
        INSERT INTO predictions ("marketId", "userId", choice, amount)
        VALUES ($1, $2, 'OPTION_A', 100)
        ON CONFLICT ("marketId", "userId") DO NOTHING
      `, [marketIds[0].id, userIds[0].id]),
      
      client.query(`
        INSERT INTO predictions ("marketId", "userId", choice, amount)
        VALUES ($1, $2, 'OPTION_B', 150)
        ON CONFLICT ("marketId", "userId") DO NOTHING
      `, [marketIds[0].id, userIds[1].id]),
      
      client.query(`
        INSERT INTO predictions ("marketId", "userId", choice, amount)
        VALUES ($1, $2, 'OPTION_A', 200)
        ON CONFLICT ("marketId", "userId") DO NOTHING
      `, [marketIds[1].id, userIds[2].id]),
      
      client.query(`
        INSERT INTO predictions ("marketId", "userId", choice, amount)
        VALUES ($1, $2, 'OPTION_B', 75)
        ON CONFLICT ("marketId", "userId") DO NOTHING
      `, [marketIds[2].id, userIds[0].id]),
    ]);

    console.log(`✅ Created/updated ${predictions.length} predictions`);

    // Create user stats
    const stats = await Promise.all([
      client.query(`
        INSERT INTO user_stats ("userId", "totalPredictions", "correctPredictions", "totalWagered", "totalWon", "winRate", rank)
        VALUES ($1, 2, 1, 175, 200, 50.0, 1)
        ON CONFLICT ("userId") DO UPDATE SET
          "totalPredictions" = EXCLUDED."totalPredictions",
          "correctPredictions" = EXCLUDED."correctPredictions",
          "totalWagered" = EXCLUDED."totalWagered",
          "totalWon" = EXCLUDED."totalWon",
          "winRate" = EXCLUDED."winRate",
          rank = EXCLUDED.rank
      `, [userIds[0].id]),
      
      client.query(`
        INSERT INTO user_stats ("userId", "totalPredictions", "correctPredictions", "totalWagered", "totalWon", "winRate", rank)
        VALUES ($1, 1, 0, 150, 0, 0.0, 3)
        ON CONFLICT ("userId") DO UPDATE SET
          "totalPredictions" = EXCLUDED."totalPredictions",
          "correctPredictions" = EXCLUDED."correctPredictions",
          "totalWagered" = EXCLUDED."totalWagered",
          "totalWon" = EXCLUDED."totalWon",
          "winRate" = EXCLUDED."winRate",
          rank = EXCLUDED.rank
      `, [userIds[1].id]),
      
      client.query(`
        INSERT INTO user_stats ("userId", "totalPredictions", "correctPredictions", "totalWagered", "totalWon", "winRate", rank)
        VALUES ($1, 1, 1, 200, 400, 100.0, 2)
        ON CONFLICT ("userId") DO UPDATE SET
          "totalPredictions" = EXCLUDED."totalPredictions",
          "correctPredictions" = EXCLUDED."correctPredictions",
          "totalWagered" = EXCLUDED."totalWagered",
          "totalWon" = EXCLUDED."totalWon",
          "winRate" = EXCLUDED."winRate",
          rank = EXCLUDED.rank
      `, [userIds[2].id]),
    ]);

    console.log(`✅ Created/updated ${stats.length} user stats`);

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
