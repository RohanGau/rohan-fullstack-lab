import process from 'process';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSMongoose from '@adminjs/mongoose';
import BlogModel from '../models/Blog.js';
import ProfileModel from '../models/Profile.js';

AdminJS.registerAdapter(AdminJSMongoose);

const adminOptions = {
  rootPath: '/',
  resources: [
    {
      resource: BlogModel,
      options: {
        properties: {
          content: { type: 'richtext' },
        },
      },
    },
    {
      resource: ProfileModel,
    },
  ],
  branding: {
    companyName: 'Rohan’s Dev Platform',
    softwareBrothers: false,
  },
};

const admin = new AdminJS(adminOptions);

// Auth section
const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@email.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

const AdminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      if (email === ADMIN.email && password === ADMIN.password) {
        return Promise.resolve({ email });
      }
      return null;
    },
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'supersecret',
  },
  null,
  {
    resave: true,
    saveUninitialized: true,
    secret: process.env.ADMIN_SESSION_SECRET || 'anothersecret',
  }
);

export default AdminRouter;
