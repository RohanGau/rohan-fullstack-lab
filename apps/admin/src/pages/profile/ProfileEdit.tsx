import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

const ProfileEdit: React.FC = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="title" />
      <NumberInput source="yearsOfExperience" />

      <ArrayInput source="skills" label="Skills">
        <SimpleFormIterator>
          <TextInput source="name" label="Skill Name" />
          <NumberInput source="rating" label="Rating (1–10)" min={1} max={10} />
          <NumberInput source="yearsOfExperience" label="Yrs of Exp" min={0} />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="bio" multiline />
      <TextInput source="avatarUrl" />
      <TextInput source="githubUrl" />
      <TextInput source="linkedinUrl" />
      <TextInput source="location" />
    </SimpleForm>
  </Edit>
);

export default ProfileEdit;
