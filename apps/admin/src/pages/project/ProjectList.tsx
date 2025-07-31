import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  DeleteButton,
} from 'react-admin';

const ProjectList = () => (
  <List title="Projects">
    <Datagrid>
      <TextField source="title" />
      <TextField source="company" />
      <TextField source="role" />
      <NumberField source="year" />
      <TextField source="type" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default ProjectList;
