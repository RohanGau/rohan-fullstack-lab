import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  DeleteButton,
} from 'react-admin';
import ChipsField from '../../components/ChipsField';

const ProjectList: React.FC = () => (
  <List title="Projects">
    <Datagrid>
      <TextField source="title" />
      <TextField source="company" />
      <TextField source="role" />
      <NumberField source="year" />
      <ChipsField source="types" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default ProjectList;