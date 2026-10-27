import { Autocomplete, SimpleGrid, TextInput, Textarea } from '@mantine/core';
import { UserRound } from 'lucide-react';
import { useRecentClients } from '@/hooks/useRecentClients';
import type { DocumentDraft } from '@/types/document';
import { EditorStep } from './EditorStep';
import type { ClientActions } from './types';

export function ClientStep({ draft, setClient, fillClient }: { draft: DocumentDraft } & ClientActions) {
  const clients = useRecentClients();
  const { client } = draft;

  const pick = (name: string) => {
    const match = clients.find((entry) => entry.name === name);
    if (match) fillClient(match);
  };

  return (
    <EditorStep
      index={1}
      title="Who is it for?"
      hint={clients.length ? 'Type to pick a past client, or add someone new.' : 'Add the person or company you are billing.'}
      done={Boolean(client.name.trim())}
    >
      <Autocomplete
        label="Name or company"
        placeholder="Acme Pvt Ltd"
        required
        leftSection={<UserRound size={15} />}
        data={clients.map((entry) => entry.name)}
        limit={8}
        value={client.name}
        onChange={(value) => setClient('name', value)}
        onOptionSubmit={pick}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <TextInput
          label="Email"
          type="email"
          placeholder="accounts@acme.com"
          value={client.email}
          onChange={(e) => setClient('email', e.currentTarget.value)}
        />
        <TextInput
          label="Phone"
          placeholder="+91 98765 43210"
          value={client.phone}
          onChange={(e) => setClient('phone', e.currentTarget.value)}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Textarea
          label="Address"
          autosize
          minRows={2}
          value={client.address}
          onChange={(e) => setClient('address', e.currentTarget.value)}
        />
        <TextInput
          label="GSTIN"
          placeholder="Only for GST-registered clients"
          maxLength={15}
          value={client.gstin ?? ''}
          onChange={(e) => setClient('gstin', e.currentTarget.value.toUpperCase())}
        />
      </SimpleGrid>
    </EditorStep>
  );
}
