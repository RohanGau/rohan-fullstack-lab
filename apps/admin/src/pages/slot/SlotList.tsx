import { List, Datagrid, TextField, EmailField, DateField, TextInput, SelectInput, EditButton, DeleteButton } from 'react-admin';

const slotStatusChoices = [
  { id: 'booked', name: 'Booked' },
  { id: 'cancelled', name: 'Cancelled' },
];

export default function SlotList() {
  return (
    <List title="Booked Slots">
      <Datagrid rowClick="show">
        <TextField source="name" label="Name" />
        <EmailField source="email" label="Email" />
        <DateField source="date" showTime label="Slot Date" />
        <TextField source="duration" label="Duration (min)" />
        <TextField source="status" label="Status" />
        <DateField source="createdAt" showTime label="Booked At" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
}
