import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

const ProfileCreate: React.FC = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" required />
      <TextInput source="email" required />
      <TextInput source="title" required />
      <NumberInput source="yearsOfExperience" required />

      <ArrayInput source="skills" label="Skills">
        <SimpleFormIterator>
          <TextInput source="name" label="Skill Name" required />
          <NumberInput source="rating" label="Rating (1–10)" min={1} max={10} required />
          <NumberInput source="yearsOfExperience" label="Yrs of Exp" min={0} required />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="bio" multiline />
      <TextInput source="avatarUrl" />
      <TextInput source="githubUrl" />
      <TextInput source="linkedinUrl" />
      <TextInput source="location" />

      <ArrayInput source="topSkills">
        <SimpleFormIterator>
          <TextInput source="" label="Top Skill" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="allTechStack">
        <SimpleFormIterator>
          <TextInput source='' label="Stack or Tool" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="impact">
        <SimpleFormIterator>
          <TextInput source='' label="Impact Statement" multiline fullWidth />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="philosophy" label="Philosophy" multiline fullWidth />

      <ArrayInput source="architectureAreas">
        <SimpleFormIterator>
          <TextInput source="title" label="Area Title" />
          <ArrayInput source="topics" label="Topics">
            <SimpleFormIterator>
              <TextInput source='' label="Topic" />
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export default ProfileCreate;
