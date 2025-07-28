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
      <ArrayInput source="skills">
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
  </Edit>
);

export default ProfileEdit;
