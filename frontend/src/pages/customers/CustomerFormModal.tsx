import { useState } from 'react';
import { Button, Group, Modal, Select, SimpleGrid, TextInput, Textarea } from '@mantine/core';
import { saveCustomer } from '@/api/catalog';
import { GST_STATES, GSTIN_PATTERN, stateOfGstin } from '@/lib/gst';
import { notify } from '@/lib/notify';
import type { Customer, CustomerInput } from '@/types/catalog';
import classes from '../catalog/CatalogForm.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY: CustomerInput = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  gstin: '',
  address: '',
  shippingAddress: '',
  stateCode: '',
  notes: '',
};

interface Props {
  opened: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}

function initial(customer: Customer | null): CustomerInput {
  if (!customer) return EMPTY;
  const { id: _id, outstanding: _outstanding, updatedAt: _updatedAt, ...input } = customer;
  return input;
}

export function CustomerFormModal({ opened, customer, onClose, onSaved }: Props) {
  const [form, setForm] = useState<CustomerInput>(() => initial(customer));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CustomerInput>(field: K, value: CustomerInput[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  const emailError = form.email && !EMAIL.test(form.email) ? 'Enter a valid email' : undefined;
  const gstinError = form.gstin && !GSTIN_PATTERN.test(form.gstin) ? 'Enter a valid 15-character GSTIN' : undefined;
  const ready = form.name.trim() && !emailError && !gstinError;

  const changeGstin = (value: string) => {
    const gstin = value.toUpperCase();
    setForm((current) => ({ ...current, gstin, stateCode: stateOfGstin(gstin) || current.stateCode }));
  };

  const submit = async () => {
    setSaving(true);
    try {
      const saved = await saveCustomer(form, customer?.id);
      notify.success(customer ? 'Customer updated' : `${saved.name} added`);
      onSaved(saved);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not save the customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} size={640} title={customer ? 'Edit customer' : 'New customer'}>
      <div className={classes.form}>
        <div className={classes.section}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="Customer name"
              placeholder="Acme Pvt Ltd"
              required
              data-autofocus
              maxLength={200}
              value={form.name}
              onChange={(e) => set('name', e.currentTarget.value)}
            />
            <TextInput
              label="Contact person"
              placeholder="Optional"
              maxLength={200}
              value={form.contactName}
              onChange={(e) => set('contactName', e.currentTarget.value)}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="accounts@acme.com"
              error={emailError}
              value={form.email}
              onChange={(e) => set('email', e.currentTarget.value)}
            />
            <TextInput
              label="Phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => set('phone', e.currentTarget.value)}
            />
          </SimpleGrid>
        </div>

        <div className={classes.section}>
          <div className={classes.sectionTitle}>Tax</div>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="GSTIN"
              placeholder="Only for GST-registered customers"
              maxLength={15}
              error={gstinError}
              value={form.gstin}
              onChange={(e) => changeGstin(e.currentTarget.value)}
            />
            <Select
              label="State"
              description="Sets the place of supply on their documents."
              placeholder="Pick a state"
              data={GST_STATES}
              searchable
              clearable
              value={form.stateCode || null}
              onChange={(value) => set('stateCode', value ?? '')}
            />
          </SimpleGrid>
        </div>

        <div className={classes.section}>
          <div className={classes.sectionTitle}>Addresses</div>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <Textarea
              label="Billing address"
              autosize
              minRows={3}
              maxLength={1000}
              value={form.address}
              onChange={(e) => set('address', e.currentTarget.value)}
            />
            <Textarea
              label="Shipping address"
              placeholder="Leave blank if it is the same"
              autosize
              minRows={3}
              maxLength={1000}
              value={form.shippingAddress}
              onChange={(e) => set('shippingAddress', e.currentTarget.value)}
            />
          </SimpleGrid>
        </div>

        <div className={classes.section}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="Website"
              placeholder="Optional"
              maxLength={200}
              value={form.website}
              onChange={(e) => set('website', e.currentTarget.value)}
            />
            <Textarea
              label="Notes"
              description="Only you see these."
              autosize
              minRows={1}
              maxLength={2000}
              value={form.notes}
              onChange={(e) => set('notes', e.currentTarget.value)}
            />
          </SimpleGrid>
        </div>
      </div>

      <Group justify="flex-end" gap="sm" className={classes.footer}>
        <Button variant="default" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button loading={saving} disabled={!ready} onClick={() => void submit()}>
          {customer ? 'Save changes' : 'Add customer'}
        </Button>
      </Group>
    </Modal>
  );
}
