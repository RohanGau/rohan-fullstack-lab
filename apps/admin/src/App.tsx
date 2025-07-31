import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import BlogCreate from './pages/blog/BlogCreate';
import BlogList from './pages/blog/BlockList';
import BlogEdit from './pages/blog/BlogEdit';
import BlogShow from './pages/blog/BlogShow';

import ProfileCreate from './pages/profile/profileCreate';
import ProfileList from './pages/profile/ProfileList';
import ProfileEdit from './pages/profile/ProfileEdit';
import ProfileShow from './pages/profile/ProfileShow';
import ContactList from './pages/contact/Contact';

import ProjectCreate from './pages/project/ProjectCreate';
import ProjectList from './pages/project/ProjectList';
import ProjectEdit from './pages/project/ProjectEdit';
import ProjectShow from './pages/project/ProjectShow';

// Replace with backend URL if deployed
const apiUrl = 'http://localhost:5050';
// const apiUrl = process.env.REACT_APP_API_URL || 'https://rohan-backend-api-stage.fly.dev';
const dataProvider = simpleRestProvider(`${apiUrl}/api`);


function App() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource
        name="blogs"
        list={BlogList}
        create={BlogCreate}
        edit={BlogEdit}
        show={BlogShow}
      />
      <Resource
        name="profiles"
        list={ProfileList}
        create={ProfileCreate}
        edit={ProfileEdit}
        show={ProfileShow}
      />
      <Resource name="contact" list={ContactList} />
      <Resource
        name="projects"
        list={ProjectList}
        create={ProjectCreate}
        edit={ProjectEdit}
        show={ProjectShow}
      />
    </Admin>
  );
}

export default App;
