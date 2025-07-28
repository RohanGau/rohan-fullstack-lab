import { List, Datagrid, TextField, DateField, EditButton, DeleteButton } from 'react-admin';

const BlogList: React.FC = () => (
  <List title="Blogs">
    <Datagrid>
      <TextField source="title" />
      <TextField source="author" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default BlogList;
