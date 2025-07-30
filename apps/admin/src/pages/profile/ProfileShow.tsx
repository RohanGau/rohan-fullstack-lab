import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  ArrayField,
  Datagrid,
  FunctionField,
} from 'react-admin';

const ProfileShow: React.FC = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="title" />
      <NumberField source="yearsOfExperience" />

      <ArrayField source="skills" label="Skills">
        <Datagrid bulkActionButtons={false}>
          <TextField source="name" />
          <NumberField source="rating" />
          <NumberField source="yearsOfExperience" label="Years of Exp" />
        </Datagrid>
      </ArrayField>

      <TextField source="bio" />
      <TextField source="location" />
      <TextField source="githubUrl" />
      <TextField source="linkedinUrl" />
    </SimpleShowLayout>
  </Show>
);

export default ProfileShow;
