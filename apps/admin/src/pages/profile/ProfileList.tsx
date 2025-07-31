import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  DeleteButton,
} from 'react-admin';

const ProfileList: React.FC = () => (
  <List title="Profiles">
    <Datagrid>
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="title" />
      <NumberField source="yearsOfExperience" />
      <TextField source="location" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default ProfileList;
