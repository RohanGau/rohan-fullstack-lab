import {
  Create,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  NumberInput,
  SelectInput,
  FormDataConsumer,
  BooleanInput,
} from 'react-admin';

const typeChoices = [
  { id: 'web', name: 'web' },
  { id: 'mobile', name: 'mobile' },
  { id: 'api', name: 'api' },
  { id: 'cli', name: 'cli' },
  { id: 'tool', name: 'tool' },
  { id: 'library', name: 'library' },
  { id: 'backend', name: 'backend' },
  { id: 'frontend', name: 'frontend' },
  { id: 'desktop', name: 'desktop' },
];

const linkKindChoices = [
  { id: 'live', name: 'live' },
  { id: 'repo', name: 'repo' },
  { id: 'docs', name: 'docs' },
  { id: 'demo', name: 'demo' },
  { id: 'design', name: 'design' },
  { id: 'other', name: 'other' },
];

const clean = (values: any) => {
  const arr = (x: any) => (Array.isArray(x) ? x : []);
  const techStack = arr(values.techStack).map((v: any) => String(v).trim()).filter(Boolean);
  const features  = arr(values.features).map((v: any) => String(v).trim()).filter(Boolean);
  const types     = arr(values.types).map((v: any) => String(v).trim()).filter(Boolean);
  const links     = arr(values.links)
    .map((l: any) => ({
      url: l?.url?.trim(),
      label: l?.label?.trim() || undefined,
      kind: l?.kind || 'other',
    }))
    .filter((l: any) => !!l.url);
  return { ...values, techStack, features, types, links };
};

const ProjectCreate: React.FC = () => (
  <Create transform={clean}>
    <SimpleForm
      defaultValues={{
        techStack: [''],
        features: [''],
        types: [''],               // 👈 ensures iterator binds an array of strings
        links: [{ url: '', label: '', kind: 'other' }],
      }}
    >
      <TextInput source="title" isRequired />
      <TextInput source="description" multiline isRequired />
      <TextInput source="company" />
      <TextInput source="role" />

      <ArrayInput source="techStack" label="Tech Stack">
        <SimpleFormIterator>
          <TextInput source="" label="Tech" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="features" label="Features">
        <SimpleFormIterator>
          <TextInput source="" label="Feature" />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="links" label="Links">
        <SimpleFormIterator inline>
          <TextInput source="url" label="URL" />
          <TextInput source="label" label="Label" />
          <SelectInput source="kind" label="Kind" choices={linkKindChoices} />
        </SimpleFormIterator>
      </ArrayInput>

      <NumberInput source="year" />
      <TextInput source="thumbnailUrl" label="Thumbnail URL" />

      {/* types[] as array of primitive strings via iterator */}
      <ArrayInput source="types" label="Types">
        <SimpleFormIterator>
          <SelectInput source="" choices={typeChoices} label="Type" />
        </SimpleFormIterator>
      </ArrayInput>
      <BooleanInput source="isFeatured" label="Show on homepage" />
    </SimpleForm>
  </Create>
);

export default ProjectCreate;
