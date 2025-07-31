import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  ArrayField,
  FunctionField,
  Datagrid,
} from 'react-admin';

const ProfileShow: React.FC = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="title" />
      <NumberField source="yearsOfExperience" />

      <ArrayField source="skills">
        <Datagrid bulkActionButtons={false}>
          <TextField source="name" />
          <NumberField source="rating" />
          <NumberField source="yearsOfExperience" label="Years of Exp" />
        </Datagrid>
      </ArrayField>

      <ArrayField source="topSkills" label="Top Skills">
        <Datagrid bulkActionButtons={false}>
          <TextField source="" />
        </Datagrid>
      </ArrayField>

      <ArrayField source="allTechStack" label="Full Stack">
        <Datagrid bulkActionButtons={false}>
          <TextField source="" />
        </Datagrid>
      </ArrayField>

      <TextField source="bio" />
      <TextField source="location" />
      <TextField source="githubUrl" />
      <TextField source="linkedinUrl" />
      <TextField source="philosophy" />

      <ArrayField source="impact">
        <Datagrid bulkActionButtons={false}>
          <FunctionField
            label="Impact"
            render={(record: any) => record}
          />
        </Datagrid>
      </ArrayField>

      <ArrayField source="architectureAreas">
        <Datagrid bulkActionButtons={false}>
          <TextField source="title" />
          <FunctionField
            label="Topics"
            render={(record: any) => record?.topics?.join(', ')}
          />
        </Datagrid>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default ProfileShow;
