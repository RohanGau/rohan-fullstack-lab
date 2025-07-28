import { Show, SimpleShowLayout, TextField, ArrayField, ChipField } from 'react-admin';

const BlogShow: React.FC = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="author" />
      <TextField source="content" />
      <ArrayField source="tags">
        <ChipField source="" />
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default BlogShow;
