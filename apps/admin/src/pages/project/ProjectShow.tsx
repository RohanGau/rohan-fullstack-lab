import {
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
  FunctionField,
  NumberField,
} from 'react-admin';

const ProjectShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="description" />
      <TextField source="company" />
      <TextField source="role" />
      <NumberField source="year" />
      <TextField source="type" />
      <TextField source="link" />
      <TextField source="thumbnailUrl" />

      <ArrayField source="techStack">
        <FunctionField render={(record: any) => record} />
      </ArrayField>
      <ArrayField source="features">
        <FunctionField render={(record: any) => record} />
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default ProjectShow;
