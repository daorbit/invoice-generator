import { useState } from 'react';
import { Autocomplete, SimpleGrid, TextInput, Textarea } from '@mantine/core';
import { UserRound } from 'lucide-react';
import { listCustomers } from '@/api/catalog';
import { useSearchOptions } from '@/hooks/useSearchOptions';
import { GSTIN_PATTERN } from '@/lib/gst';
import type { DocumentDraft } from '@/types/document';
import { EditorStep } from './EditorStep';
import { PickerOption } from './PickerOption';
import type { ClientActions } from './types';

const GSTIN_LENGTH = 15;

export function ClientStep({ draft, setClient, fillCustomer }: { draft: DocumentDraft } & ClientActions) {
  const { client } = draft;
  const [focused, setFocused] = useState(false);
  const customers = useSearchOptions(listCustomers, client.name, focused);
  const gstinInvalid = client.gstin?.length === GSTIN_LENGTH && !GSTIN_PATTERN.test(client.gstin);

  const pick = (name: string) => {
    const match = customers.find((entry) => entry.name === name);
    if (match) fillCustomer(match);
  };

  const description = !client.name.trim()
    ? 'Pick a saved customer or type a new name.'
    : draft.customerId
      ? 'From your customers.'
      : 'New customer. Added to Customers when you save.';

  return (
    <EditorStep index={1} title="Who is it for?" hint="Pick a customer, or add someone new." done={Boolean(client.name.trim())}>
      <Autocomplete
        label="Customer"
        description={description}
        placeholder="Acme Pvt Ltd"
        required
        leftSection={<UserRound size={15} />}
        data={customers.map((entry) => entry.name)}
        filter={({ options }) => options}
        limit={8}
        value={client.name}
        onChange={(value) => setClient('name', value)}
        onOptionSubmit={pick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        renderOption={({ option }) => {
          const match = customers.find((entry) => entry.name === option.value);
          return <PickerOption title={option.value} detail={[match?.email, match?.gstin].filter(Boolean).join(' · ')} />;
        }}
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
          maxLength={GSTIN_LENGTH}
          error={gstinInvalid ? 'This GSTIN does not look right' : undefined}
          value={client.gstin ?? ''}
          onChange={(e) => setClient('gstin', e.currentTarget.value.toUpperCase())}
        />
      </SimpleGrid>
    </EditorStep>
  );
}
