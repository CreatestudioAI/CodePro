import { useState, useEffect } from 'react';
import { DialogRoot } from '~/components/ui/Dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Badge } from '~/components/ui/Badge';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';

interface APIService {
  name: string;
  displayName: string;
  type: string;
  icon: string;
  getKeyUrl: string;
  placeholder: string;
  description: string;
}

const API_SERVICES: APIService[] = [
  {
    name: 'ANTHROPIC_API_KEY',
    displayName: 'Anthropic Claude',
    type: 'ai',
    icon: '🤖',
    getKeyUrl: 'https://console.anthropic.com/',
    placeholder: 'sk-ant-...',
    description: 'Claude AI models for advanced reasoning and long context',
  },
  {
    name: 'OPENAI_API_KEY',
    displayName: 'OpenAI',
    type: 'ai',
    icon: '🔮',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
    description: 'GPT models for chat, completion, and embeddings',
  },
  {
    name: 'GOOGLE_GENERATIVE_AI_API_KEY',
    displayName: 'Google Gemini',
    type: 'ai',
    icon: '🌟',
    getKeyUrl: 'https://makersuite.google.com/app/apikey',
    placeholder: 'AI...',
    description: 'Google Gemini multimodal AI models',
  },
  {
    name: 'GROQ_API_KEY',
    displayName: 'Groq',
    type: 'ai',
    icon: '⚡',
    getKeyUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
    description: 'Ultra-fast LLM inference',
  },
  {
    name: 'VITE_GITHUB_ACCESS_TOKEN',
    displayName: 'GitHub',
    type: 'deployment',
    icon: '🐙',
    getKeyUrl: 'https://github.com/settings/tokens',
    placeholder: 'ghp_...',
    description: 'Repository management and deployment',
  },
  {
    name: 'VITE_VERCEL_ACCESS_TOKEN',
    displayName: 'Vercel',
    type: 'deployment',
    icon: '▲',
    getKeyUrl: 'https://vercel.com/account/tokens',
    placeholder: 'vc_...',
    description: 'Deploy to Vercel platform',
  },
  {
    name: 'VITE_NETLIFY_ACCESS_TOKEN',
    displayName: 'Netlify',
    type: 'deployment',
    icon: '🌐',
    getKeyUrl: 'https://app.netlify.com/user/applications',
    placeholder: 'nf_...',
    description: 'Deploy to Netlify platform',
  },
  {
    name: 'GODADDY_API_KEY',
    displayName: 'GoDaddy',
    type: 'hosting',
    icon: '🌍',
    getKeyUrl: 'https://developer.godaddy.com/keys',
    placeholder: 'key_...',
    description: 'Domain and hosting management',
  },
  {
    name: 'DIGITALOCEAN_API_TOKEN',
    displayName: 'DigitalOcean',
    type: 'hosting',
    icon: '🐋',
    getKeyUrl: 'https://cloud.digitalocean.com/account/api/tokens',
    placeholder: 'dop_...',
    description: 'Cloud infrastructure and droplets',
  },
  {
    name: 'REPLICATE_API_TOKEN',
    displayName: 'Replicate GPU',
    type: 'gpu',
    icon: '🎮',
    getKeyUrl: 'https://replicate.com/account/api-tokens',
    placeholder: 'r8_...',
    description: 'GPU hosting for AI models',
  },
  {
    name: 'RUNPOD_API_KEY',
    displayName: 'RunPod',
    type: 'gpu',
    icon: '🚀',
    getKeyUrl: 'https://www.runpod.io/console/user/settings',
    placeholder: 'rp_...',
    description: 'Serverless GPU computing',
  },
];

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', icon: '🔧' },
  { id: 'ai', label: 'AI Models', icon: '🤖' },
  { id: 'deployment', label: 'Deployment', icon: '🚀' },
  { id: 'hosting', label: 'Hosting', icon: '🌐' },
  { id: 'gpu', label: 'GPU Hosting', icon: '🎮' },
];

interface EnhancedAPIKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedAPIKeyManager({ isOpen, onClose }: EnhancedAPIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
    }
  }, [isOpen]);

  const loadApiKeys = () => {
    const stored: Record<string, string> = {};

    API_SERVICES.forEach((service) => {
      const value = localStorage.getItem(service.name);

      if (value) {
        stored[service.name] = value;
      }
    });
    setApiKeys(stored);
  };

  const handleSaveKey = (serviceName: string, value: string) => {
    const newKeys = { ...apiKeys, [serviceName]: value };
    setApiKeys(newKeys);

    if (value) {
      localStorage.setItem(serviceName, value);
    } else {
      localStorage.removeItem(serviceName);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);

    try {
      Object.entries(apiKeys).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
      toast.success('API keys saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save API keys');
    } finally {
      setSaving(false);
    }
  };

  const filteredServices =
    selectedCategory === 'all' ? API_SERVICES : API_SERVICES.filter((s) => s.type === selectedCategory);

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
            <div className="w-full max-w-4xl max-h-[90vh] bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-bolt-elements-borderColor">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-1">API Keys & Services</h2>
              <p className="text-sm text-bolt-elements-textSecondary">
                Configure your API keys for AI, deployment, and hosting services
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
            >
              <div className="i-ph:x text-xl" />
            </button>
          </div>
        </div>

        <div>
          <div className="px-6 pt-4 border-b border-bolt-elements-borderColor">
            <div className="flex gap-2 pb-4 overflow-x-auto">
              {SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={classNames(
                    'flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors',
                    selectedCategory === category.id
                      ? 'bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary'
                      : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2',
                  )}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[55vh] p-6">
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.name}
                  className="p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{service.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-bolt-elements-textPrimary">{service.displayName}</h3>
                        {apiKeys[service.name] && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            <div className="i-ph:check-circle-fill mr-1" />
                            Configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-bolt-elements-textSecondary mb-3">{service.description}</p>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            value={apiKeys[service.name] || ''}
                            onChange={(e) => handleSaveKey(service.name, e.target.value)}
                            placeholder={service.placeholder}
                            className="flex-1 font-mono text-sm"
                          />
                          <Button
                            variant="secondary"
                            onClick={() => window.open(service.getKeyUrl, '_blank')}
                            className="whitespace-nowrap"
                          >
                            <div className="i-ph:key mr-2" />
                            Get Key
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="p-6 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-bolt-elements-textSecondary">
              {Object.keys(apiKeys).length} service{Object.keys(apiKeys).length !== 1 ? 's' : ''} configured
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                {saving ? (
                  <>
                    <div className="i-ph:spinner animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <div className="i-ph:check mr-2" />
                    Save All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </DialogRoot>
  );
}
