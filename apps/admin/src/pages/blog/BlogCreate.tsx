import { Create, SimpleForm, TextInput, ArrayInput, SimpleFormIterator } from 'react-admin';

const BlogCreate: React.FC = () => (
  <Create>
    <SimpleForm>
      <TextInput label="Title" source="title" required />
      <TextInput label="Author" source="author" required />
      <TextInput label="Content" source="content" multiline required />
      <ArrayInput label="Tags" source="tags">
        <SimpleFormIterator>
          <TextInput source={''} />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export default BlogCreate;
