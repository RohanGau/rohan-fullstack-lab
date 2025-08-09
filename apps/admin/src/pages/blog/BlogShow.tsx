import {
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
  ChipField,
  DateField,
  BooleanField,
  UrlField,
} from 'react-admin';

const BlogShow: React.FC = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="slug" />
      <TextField source="author" />
      <TextField source="summary" />
      <TextField source="content" />
      <ArrayField source="tags">
        <ChipField source="" />
      </ArrayField>
      <ArrayField source="links">
        <SimpleShowLayout>
          <UrlField source="url" />
          <TextField source="label" />
          <TextField source="kind" />
        </SimpleShowLayout>
      </ArrayField>
      <UrlField source="coverImageUrl" />
      <TextField source="readingTime" />
      <BooleanField source="isFeatured" />
      <TextField source="status" />
      <DateField source="publishedAt" showTime />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export default BlogShow;
