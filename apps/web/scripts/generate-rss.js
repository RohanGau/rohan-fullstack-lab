const { Feed } = require('feed');
const fs = require('fs');

async function generateRSS() {
  // Fetch blog posts from your public API endpoint
  const response = await fetch('https://rohan-backend-api.fly.dev/api/blogs');
  const posts = await response.json();

  const feed = new Feed({
    title: 'Rohan Kumar Blog',
    description: 'Senior Software Engineer. Building clean, scalable web experiences.',
    id: 'https://rohangautam.dev/',
    link: 'https://rohangautam.dev/',
    language: 'en',
    favicon: 'https://rohangautam.dev/favicon.ico',
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `https://rohangautam.dev/blog/${post.id}`,
      link: `https://rohangautam.dev/blog/${post.id}`,
      description: post.content.slice(0, 160),
      date: new Date(post.publishedAt),
      author: [{ name: post.author }],
    });
  });

  fs.writeFileSync('./public/rss.xml', feed.rss2());
}

generateRSS().catch((err) => {
  console.error('RSS generation failed:', err);
  process.exit(1);
});
