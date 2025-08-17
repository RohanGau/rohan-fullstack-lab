import { Show, SimpleShowLayout, TextField, DateField, EmailField } from 'react-admin';

export default function SlotShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <EmailField source="email" />
        <TextField source="message" />
        <DateField source="date" showTime />
        <TextField source="duration" />
        <TextField source="status" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}
