import {
  Create,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  NumberInput,
} from 'react-admin';

const ProjectCreate: React.FC = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" required />
      <TextInput source="description" multiline fullWidth required />
      <TextInput source="company" />
      <TextInput source="role" />
      <ArrayInput source="techStack">
        <SimpleFormIterator>
          <TextInput source="" label="Tech" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="features">
        <SimpleFormIterator>
          <TextInput source="" label="Feature" />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="link" />
      <NumberInput source="year" />
      <TextInput source="thumbnailUrl" />
      <TextInput source="type" label="Type (e.g. web, mobile, api)" />
    </SimpleForm>
  </Create>
);

export default ProjectCreate;
