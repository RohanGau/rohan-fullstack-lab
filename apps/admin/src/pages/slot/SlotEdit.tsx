import {
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  NumberInput,
  SelectInput,
} from 'react-admin';

const slotStatusChoices = [
  { id: 'booked', name: 'Booked' },
  { id: 'cancelled', name: 'Cancelled' },
];

const clean = (values: any) => {
  let duration = Number(values.duration);
  if (isNaN(duration) || duration < 15 || duration > 120) duration = 30;
  return {
    ...values,
    duration,
    message: typeof values.message === 'string' ? values.message.trim() : undefined,
    status: slotStatusChoices.find(s => s.id === values.status) ? values.status : 'booked',
  };
};

const SlotEdit: React.FC = () => (
  <Edit mutationMode="pessimistic" transform={clean} title="Edit Slot Booking">
    <SimpleForm>
      <TextInput source="name" label="Name" disabled />
      <TextInput source="email" label="Email" disabled />
      <DateTimeInput source="date" label="Slot Date" />
      <NumberInput source="duration" label="Duration (min)" min={15} max={120} />
      <TextInput source="message" label="Message" multiline />
      <SelectInput source="status" label="Status" choices={slotStatusChoices} />
    </SimpleForm>
  </Edit>
);

export default SlotEdit;
