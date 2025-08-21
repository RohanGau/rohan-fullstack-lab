/** @type {import('next-sitemap').IConfig} */
const siteUrl = 'https://rohangautam.dev';

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    const priority = path.startsWith('/blog') ? 0.7 : 0.5;
    return {
      loc: path,
      changefreq: 'weekly',
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },
  exclude: ['/admin', '/api/*', '/404'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
};
