import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  EditButton,
  DeleteButton,
} from 'react-admin';

const BlogList: React.FC = () => (
  <List title="Blogs" sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="title" />
      <TextField source="slug" />
      <TextField source="author" />
      <TextField source="status" />
      <BooleanField source="isFeatured" />
      <DateField source="publishedAt" showTime />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default BlogList;
