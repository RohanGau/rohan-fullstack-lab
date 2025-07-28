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
          <TextInput source={''} />
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
