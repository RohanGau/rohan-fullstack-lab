import {
  Edit,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  BooleanInput,
  NumberInput,
  SelectInput,
  DateTimeInput,
} from 'react-admin';

const EDIT_ALLOWED = [
  'title','slug','content','summary','author',
  'tags','links','coverImageUrl','readingTime',
  'isFeatured','status','publishedAt',
];

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

const BlogEdit: React.FC = () => (
  <Edit transform={(data) => Object.fromEntries(
      Object.entries(data).filter(([k,v]) => EDIT_ALLOWED.includes(k) && v !== undefined)
  )}>
    <SimpleForm>
      <TextInput source="title" required fullWidth />
      <TextInput source="slug" fullWidth />
      <TextInput source="author" required />
      <TextInput source="summary" multiline fullWidth />
      <TextInput source="content" multiline required fullWidth rows={10} />

      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="links">
        <SimpleFormIterator>
          <TextInput source="url" label="URL" required />
          <TextInput source="label" label="Label" />
          <SelectInput source="kind" label="Kind" choices={linkKinds} />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="coverImageUrl" label="Cover Image URL" fullWidth />
      <NumberInput source="readingTime" min={1} max={120} />
      <BooleanInput source="isFeatured" />
      <SelectInput source="status" choices={statusChoices} />
      <DateTimeInput source="publishedAt" />
    </SimpleForm>
  </Edit>
);

export default BlogEdit;
