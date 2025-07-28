import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  ArrayField,
  ChipField,
} from 'react-admin';

const ProfileShow: React.FC = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="title" />
      <NumberField source="yearsOfExperience" />
      <ArrayField source="skills">
        <ChipField source="" />
      </ArrayField>
      <TextField source="bio" />
      <TextField source="location" />
      <TextField source="githubUrl" />
      <TextField source="linkedinUrl" />
    </SimpleShowLayout>
  </Show>
);

export default ProfileShow;
