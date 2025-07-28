import {
  Edit,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

const BlogEdit: React.FC = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="author" />
      <TextInput source="content" multiline />
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="" /> {/* <-- SHOULD be 'source' set */}
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);


export default BlogEdit;
