import {
  Create,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  BooleanInput,
  NumberInput,
  SelectInput,
  DateTimeInput,
} from 'react-admin';

const statusChoices = [
  { id: 'draft', name: 'Draft' },
  { id: 'published', name: 'Published' },
  { id: 'archived', name: 'Archived' },
];

const linkKinds = [
  { id: 'repo', name: 'Repository' },
  { id: 'ref', name: 'Reference' },
  { id: 'demo', name: 'Demo' },
  { id: 'other', name: 'Other' },
];

const BlogCreate: React.FC = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" required fullWidth />
      <TextInput source="slug" helperText="Optional, auto-generated from title if left blank" fullWidth />
      <TextInput source="author" required />
      <TextInput source="summary" multiline fullWidth />
      <TextInput source="content" multiline required fullWidth rows={10} />

      <ArrayInput source="tags" label="Tags">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="links" label="Links">
        <SimpleFormIterator>
          <TextInput source="url" label="URL" required />
          <TextInput source="label" label="Label" />
          <SelectInput source="kind" label="Kind" choices={linkKinds} />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="coverImageUrl" label="Cover Image URL" fullWidth />
      <NumberInput source="readingTime" label="Reading Time (min)" min={1} max={120} />
      <BooleanInput source="isFeatured" />
      <SelectInput source="status" choices={statusChoices} defaultValue="draft" />
      <DateTimeInput source="publishedAt" label="Published At" />
    </SimpleForm>
  </Create>
);

export default BlogCreate;
