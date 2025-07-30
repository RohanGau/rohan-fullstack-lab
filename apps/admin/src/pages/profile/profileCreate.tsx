import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

const ProfileCreate: React.FC = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" required />
      <TextInput source="email" required />
      <TextInput source="title" required />
      <NumberInput source="yearsOfExperience" required />

      <ArrayInput source="skills" label="Skills">
        <SimpleFormIterator>
          <TextInput source="name" label="Skill Name" required />
          <NumberInput source="rating" label="Rating (1–10)" min={1} max={10} required />
          <NumberInput source="yearsOfExperience" label="Yrs of Exp" min={0} required />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="bio" multiline />
      <TextInput source="avatarUrl" />
      <TextInput source="githubUrl" />
      <TextInput source="linkedinUrl" />
      <TextInput source="location" />
    </SimpleForm>
  </Create>
);

export default ProfileCreate;
