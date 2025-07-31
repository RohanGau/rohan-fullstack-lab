import {
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
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

      <ArrayField source="techStack" label="Tech Stack">
        <SimpleShowLayout>
          <TextField source="" />
        </SimpleShowLayout>
      </ArrayField>

      <ArrayField source="features" label="Features">
        <SimpleShowLayout>
          <TextField source="" />
        </SimpleShowLayout>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default ProjectShow;
