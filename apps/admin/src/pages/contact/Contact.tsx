import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  DeleteButton,
} from 'react-admin';

const ContactList = () => (
  <List title="Messages" sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="message" />
      <DateField source="createdAt" showTime />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default ContactList;
