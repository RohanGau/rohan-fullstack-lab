import {
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
  NumberField,
  Datagrid,
  UrlField,
} from 'react-admin';
import ChipsField from '../../components/ChipsField';

const ProjectShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="description" />
      <TextField source="company" />
      <TextField source="role" />
      <NumberField source="year" />
      <TextField source="thumbnailUrl" />

      <ChipsField source="types" />
      <ChipsField source="techStack" />
      <ChipsField source="features" />

      <ArrayField source="links" label="Links">
        <Datagrid bulkActionButtons={false}>
          <UrlField source="url" />
          <TextField source="label" />
          <TextField source="kind" />
        </Datagrid>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default ProjectShow;
