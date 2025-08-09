import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

const cleanProjectPayload = (values: any) => {
    const { id, _id, __v, createdAt, updatedAt, ...rest } = values;
    const arr = (x:any)=> (Array.isArray(x)?x:[]);
    const techStack = arr(rest.techStack).map((s:any)=>String(s).trim()).filter(Boolean);
    const features  = arr(rest.features).map((s:any)=>String(s).trim()).filter(Boolean);
    const links     = arr(rest.links).map((l:any)=>({
      url: l?.url?.trim(),
      label: l?.label?.trim() || undefined,
      kind: l?.kind || 'other',
    })).filter((l:any)=>!!l.url);
    const types     = arr(rest.types).map((s:any)=>String(s).trim()).filter(Boolean);

    return { ...rest, techStack, features, links, types };
  };
  
const ProfileEdit: React.FC = () => (

  <Edit mutationMode="pessimistic" transform={cleanProjectPayload}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="title" />
      <NumberInput source="yearsOfExperience" />

      <ArrayInput source="skills" label="Skills">
        <SimpleFormIterator>
          <TextInput source="name" label="Skill Name" />
          <NumberInput source="rating" label="Rating (1–10)" min={1} max={10} />
          <NumberInput source="yearsOfExperience" label="Yrs of Exp" min={0} />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="bio" multiline />
      <TextInput source="avatarUrl" />
      <TextInput source="githubUrl" />
      <TextInput source="linkedinUrl" />
      <TextInput source="location" />

      {/* ✅ Extended About Page Fields */}
      <ArrayInput source="topSkills" label="Top Skills">
        <SimpleFormIterator>
          <TextInput source="" label="Top Skill" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="allTechStack" label="All Tech Stack">
        <SimpleFormIterator>
          <TextInput source="" label="Stack or Tool" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="impact" label="Impact Statements">
        <SimpleFormIterator>
          <TextInput source="" label="Impact" multiline fullWidth />
        </SimpleFormIterator>
      </ArrayInput>

      <TextInput source="philosophy" label="Philosophy" multiline fullWidth />

      <ArrayInput source="architectureAreas" label="Architecture Areas">
        <SimpleFormIterator>
          <TextInput source="title" label="Area Title" />
          <ArrayInput source="topics" label="Topics">
            <SimpleFormIterator>
              <TextInput source="" label="Topic" />
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default ProfileEdit;
