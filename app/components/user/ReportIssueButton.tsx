import { useState } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { DialogRoot } from '~/components/ui/Dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { toast } from 'react-toastify';

export function ReportIssueButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'bug',
    priority: 'medium',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        toast.error('Unable to submit ticket');
        return;
      }

      const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const response = await fetch(`${supabaseUrl}/rest/v1/support_tickets`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          ticket_number: ticketNumber,
          ...formData,
          status: 'open',
        }),
      });

      if (response.ok) {
        toast.success(`Ticket ${ticketNumber} created successfully!`);
        setFormData({ subject: '', category: 'bug', priority: 'medium', description: '' });
        setIsOpen(false);
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <IconButton
        title="Report Issue"
        onClick={() => setIsOpen(true)}
        className="bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive"
      >
        <div className="i-ph:bug text-lg" />
      </IconButton>

      <DialogRoot open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay asChild>
            <motion.div
              className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </RadixDialog.Overlay>
          <RadixDialog.Content asChild>
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] focus:outline-none"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <div className="w-full max-w-lg bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl border border-bolt-elements-borderColor">
                <div className="p-6 border-b border-bolt-elements-borderColor">
                  <div className="flex items-center gap-3">
                    <div className="i-ph:bug text-2xl text-orange-500" />
                    <h2 className="text-xl font-bold text-bolt-elements-textPrimary">Report an Issue</h2>
                  </div>
                  <p className="text-sm text-bolt-elements-textSecondary mt-2">
                    Describe the problem you're experiencing and we'll help you resolve it
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Label>Subject *</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of the issue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary"
                      >
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="support">Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      className="w-full px-3 py-2 rounded border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-bolt-elements-borderColor flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="i-ph:spinner animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <div className="i-ph:paper-plane-tilt mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </DialogRoot>
    </>
  );
}
