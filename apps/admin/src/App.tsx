import { Admin, Resource, CustomRoutes, fetchUtils } from 'react-admin';
import { Route } from 'react-router-dom';
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
import AssetUploadSection from './components/AssetUploadSection';

import SlotList from './pages/slot/SlotList';
import SlotEdit from './pages/slot/SlotEdit';
import SlotShow from './pages/slot/SlotShow';


import { CustomLayout } from './layout/CustomLayout';
import { ADMIN_TOKEN_KEY } from './AuthDataProvider';

import authProvider from './AuthDataProvider';
import LoginPage from './login';

const httpClient  = (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers();
  }
  if (!(options.headers instanceof Headers)) {
    options.headers = new Headers(options.headers);
  }
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

// Replace with backend URL if deployed
const apiUrl = process.env.REACT_APP_API_URL || 'https://rohan-backend-api-stage.fly.dev';
const dataProvider = simpleRestProvider(`${apiUrl}/api`, httpClient);


function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
      layout={CustomLayout}
    >
      <CustomRoutes>
        <Route path="/assets" element={<AssetUploadSection apiUrl={apiUrl} />} />
      </CustomRoutes>
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
      <Resource
        name="slots"
        list={SlotList}
        edit={SlotEdit}
        show={SlotShow}
      />
    </Admin>
  );
}

export default App;
