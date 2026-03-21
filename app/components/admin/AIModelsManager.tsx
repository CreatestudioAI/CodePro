import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { Card } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { DialogRoot } from '~/components/ui/Dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface AIModel {
  id: string;
  provider: string;
  model_name: string;
  model_id: string;
  version: string;
  is_default: boolean;
  is_active: boolean;
  release_date: string;
  capabilities: Record<string, any>;
}

const AI_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', icon: '🤖' },
  { id: 'openai', name: 'OpenAI', icon: '🔮' },
  { id: 'google', name: 'Google', icon: '🌟' },
  { id: 'groq', name: 'Groq', icon: '⚡' },
  { id: 'cohere', name: 'Cohere', icon: '🧠' },
  { id: 'mistral', name: 'Mistral', icon: '🌪️' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔍' },
];

export function AIModelsManager() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      const response = await fetch(`${supabaseUrl}/rest/v1/ai_model_configs?order=provider,model_name`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModels(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (modelId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      await fetch(`${supabaseUrl}/rest/v1/ai_model_configs?is_default=eq.true`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_default: false }),
      });

      await fetch(`${supabaseUrl}/rest/v1/ai_model_configs?id=eq.${modelId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_default: true }),
      });

      toast.success('Default model updated successfully');
      loadModels();
    } catch (error) {
      toast.error('Failed to update default model');
    }
  };

  const handleToggleActive = async (modelId: string, isActive: boolean) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      await fetch(`${supabaseUrl}/rest/v1/ai_model_configs?id=eq.${modelId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      toast.success(`Model ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadModels();
    } catch (error) {
      toast.error('Failed to update model status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-bolt-elements-textPrimary">AI Model Management</h2>
          <p className="text-bolt-elements-textSecondary mt-1">
            Configure and update AI models to keep the platform using the newest versions
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <div className="i-ph:plus mr-2" />
          Add Model
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="i-ph:spinner animate-spin text-4xl text-bolt-elements-loader-progress" />
        </div>
      ) : (
        <div className="grid gap-4">
          {AI_PROVIDERS.map((provider) => {
            const providerModels = models.filter((m) => m.provider === provider.id);

            if (providerModels.length === 0) return null;

            return (
              <Card key={provider.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{provider.icon}</span>
                  <h3 className="text-xl font-semibold text-bolt-elements-textPrimary">{provider.name}</h3>
                  <Badge variant="secondary">{providerModels.length} models</Badge>
                </div>

                <div className="space-y-3">
                  {providerModels.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-bolt-elements-textPrimary">{model.model_name}</h4>
                          {model.is_default && (
                            <Badge className="bg-green-500/20 text-green-400">
                              <div className="i-ph:check-circle-fill mr-1" />
                              Default
                            </Badge>
                          )}
                          {model.is_active ? (
                            <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-bolt-elements-textSecondary">
                          <span>Model ID: {model.model_id}</span>
                          {model.version && <span>Version: {model.version}</span>}
                          {model.release_date && (
                            <span>Released: {new Date(model.release_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!model.is_default && model.is_active && (
                          <Button variant="secondary" size="sm" onClick={() => handleSetDefault(model.id)}>
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(model.id, model.is_active)}
                        >
                          <div className={model.is_active ? 'i-ph:toggle-right' : 'i-ph:toggle-left'} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingModel(model)}>
                          <div className="i-ph:pencil" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddModelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadModels();
        }}
      />

      {editingModel && (
        <EditModelModal
          model={editingModel}
          onClose={() => setEditingModel(null)}
          onSuccess={() => {
            setEditingModel(null);
            loadModels();
          }}
        />
      )}
    </div>
  );
}

function AddModelModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    provider: '',
    model_name: '',
    model_id: '',
    version: '',
    release_date: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      const response = await fetch(`${supabaseUrl}/rest/v1/ai_model_configs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          ...formData,
          is_active: true,
          is_default: false,
        }),
      });

      if (response.ok) {
        toast.success('Model added successfully');
        onSuccess();
      } else {
        toast.error('Failed to add model');
      }
    } catch (error) {
      toast.error('Failed to add model');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <div className="w-full max-w-md bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl border border-bolt-elements-borderColor">
              <div className="p-6 border-b border-bolt-elements-borderColor">
                <h2 className="text-xl font-bold text-bolt-elements-textPrimary">Add New AI Model</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label>Provider</Label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary"
                  >
                    <option value="">Select provider</option>
                    {AI_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Model Name</Label>
                  <Input
                    value={formData.model_name}
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                    placeholder="e.g., GPT-4 Turbo"
                  />
                </div>

                <div>
                  <Label>Model ID</Label>
                  <Input
                    value={formData.model_id}
                    onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                    placeholder="e.g., gpt-4-turbo"
                  />
                </div>

                <div>
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 0125"
                  />
                </div>

                <div>
                  <Label>Release Date</Label>
                  <Input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-bolt-elements-borderColor flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Model'}
                </Button>
              </div>
            </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </DialogRoot>
  );
}

function EditModelModal({
  model,
  onClose,
  onSuccess,
}: {
  model: AIModel;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    model_name: model.model_name,
    version: model.version,
    release_date: model.release_date,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      await fetch(`${supabaseUrl}/rest/v1/ai_model_configs?id=eq.${model.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      toast.success('Model updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update model');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogRoot open={true} onOpenChange={(open) => !open && onClose()}>
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
            <div className="w-full max-w-md bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl border border-bolt-elements-borderColor">
              <div className="p-6 border-b border-bolt-elements-borderColor">
                <h2 className="text-xl font-bold text-bolt-elements-textPrimary">Edit Model</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label>Model Name</Label>
                  <Input
                    value={formData.model_name}
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Release Date</Label>
                  <Input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-bolt-elements-borderColor flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </DialogRoot>
  );
}
