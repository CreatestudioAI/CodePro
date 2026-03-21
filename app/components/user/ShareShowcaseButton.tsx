import { useState } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { DialogRoot } from '~/components/ui/Dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { toast } from 'react-toastify';

interface ShareShowcaseButtonProps {
  websiteUrl: string;
  websiteTitle?: string;
  chatId?: string;
}

export function ShareShowcaseButton({ websiteUrl, websiteTitle, chatId }: ShareShowcaseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: websiteTitle || '',
    description: '',
    tags: '',
    github_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        toast.error('Unable to share to showcase');
        return;
      }

      const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

      const response = await fetch(`${supabaseUrl}/rest/v1/showcase_submissions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          live_url: websiteUrl,
          github_url: formData.github_url || null,
          tags: tagsArray,
          status: 'pending',
        }),
      });

      if (response.ok) {
        toast.success('Submitted to showcase! Pending admin approval.');
        setIsOpen(false);
      } else {
        toast.error('Failed to submit to showcase');
      }
    } catch (error) {
      toast.error('Failed to submit to showcase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <IconButton
        title="Share to Showcase"
        onClick={() => setIsOpen(true)}
        className="bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive"
      >
        <div className="i-ph:share-network text-lg" />
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
                    <div className="i-ph:star text-2xl text-yellow-500" />
                    <h2 className="text-xl font-bold text-bolt-elements-textPrimary">Share to Showcase</h2>
                  </div>
                  <p className="text-sm text-bolt-elements-textSecondary mt-2">
                    Share your creation with the community! Pending admin approval.
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="My Amazing Project"
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell the community about your project..."
                      rows={4}
                      className="w-full px-3 py-2 rounded border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary resize-none"
                    />
                  </div>

                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="react, portfolio, minimalist"
                    />
                  </div>

                  <div>
                    <Label>GitHub Repository (optional)</Label>
                    <Input
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-start gap-2">
                      <div className="i-ph:info text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-400">
                        <p className="font-medium mb-1">Live URL:</p>
                        <p className="opacity-80">{websiteUrl}</p>
                      </div>
                    </div>
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
                        <div className="i-ph:share-network mr-2" />
                        Submit to Showcase
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
