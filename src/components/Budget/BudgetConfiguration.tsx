import { useState } from 'react';
import { Alert, Button, Group, NumberInput, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';


export function BudgetConfiguration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      start_day: 1,
    },

    validate: {
      name: (value) => (!value || value.length < 2 ? 'Name must have at least 2 letters' : null),
      start_day: (value) => (value < 1 || value > 31 ? 'Start day must be between 1 and 31' : null),
    },
  });

  const onSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      console.log(values);
      setSuccess(true);
    } catch (error) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="md" radius="lg" p="xl" h="100%">

      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        {error && (
          <Alert color="red" mb="md" title="Error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" mb="md" title="Success">
            Budget updated successfully!
          </Alert>
        )}

        <Stack align='flex-start'>
          <Title order={2}>Budget Configuration</Title>
        <TextInput
          label="Budget Name"
          placeholder="My Budget"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <NumberInput
          label="Start day"
          placeholder="Stard day"
          min={1}
          max={31}
          key={form.key('start_day')}
          {...form.getInputProps('start_day')}
        />
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button type="submit">Update Budget</Button>
        </Group>
      </form>
    </Paper>
  );
}