import {
  Edit,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  NumberInput,
} from 'react-admin';

const ProjectEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline fullWidth />
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
      <TextInput source="type" />
    </SimpleForm>
  </Edit>
);

export default ProjectEdit;
