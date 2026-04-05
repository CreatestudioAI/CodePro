import { useEffect, useState } from 'react';
import { DialogRoot } from '~/components/ui/Dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Badge } from '~/components/ui/Badge';
import { classNames } from '~/utils/classNames';

interface StarterTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail_url?: string;
  features: string[];
  difficulty: string;
  tags: string[];
  is_featured: boolean;
}

interface StarterTemplatesEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StarterTemplate) => void;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '📦' },
  { id: 'Technology', label: 'Technology', icon: '💻' },
  { id: 'E-commerce', label: 'E-commerce', icon: '🛒' },
  { id: 'Portfolio', label: 'Portfolio', icon: '🎨' },
  { id: 'Marketing and Agency', label: 'Marketing & Agency', icon: '📢' },
  { id: 'Film and TV', label: 'Film & TV', icon: '🎬' },
  { id: 'Music', label: 'Music', icon: '🎵' },
  { id: 'Booking', label: 'Booking', icon: '📅' },
];

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function StarterTemplatesEnhanced({ isOpen, onClose, onSelectTemplate }: StarterTemplatesEnhancedProps) {
  const [templates, setTemplates] = useState<StarterTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase not configured');
        setLoading(false);
        return;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/starter_templates?order=is_featured.desc,category,name`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates =
    selectedCategory === 'all' ? templates : templates.filter((template) => template.category === selectedCategory);

  const featuredTemplates = filteredTemplates.filter((t) => t.is_featured);
  const regularTemplates = filteredTemplates.filter((t) => !t.is_featured);

  const handleSelectTemplate = (template: StarterTemplate) => {
    onSelectTemplate(template);
    onClose();
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
            <div className="w-full max-w-7xl max-h-[90vh] bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-bolt-elements-borderColor bg-gradient-to-r from-bolt-elements-background-depth-2 to-bolt-elements-background-depth-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-bolt-elements-textPrimary mb-1">Starter Templates</h2>
              <p className="text-sm text-bolt-elements-textSecondary">
                Choose a professional template to jumpstart your project
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
            >
              <div className="i-ph:x text-2xl" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="px-6 pt-4 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
            <div className="flex gap-2 pb-4 overflow-x-auto">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={classNames(
                    'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors',
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

          <ScrollArea className="h-[65vh] p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                  <div className="i-ph:spinner animate-spin text-5xl text-bolt-elements-loader-progress" />
                  <p className="text-bolt-elements-textSecondary text-lg">Loading templates...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {featuredTemplates.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="i-ph:star-fill text-yellow-500 text-xl" />
                      <h3 className="text-xl font-semibold text-bolt-elements-textPrimary">Featured Templates</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredTemplates.map((template) => (
                        <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
                      ))}
                    </div>
                  </div>
                )}

                {regularTemplates.length > 0 && (
                  <div>
                    {featuredTemplates.length > 0 && (
                      <h3 className="text-xl font-semibold text-bolt-elements-textPrimary mb-4">More Templates</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularTemplates.map((template) => (
                        <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 text-bolt-elements-textSecondary">
                <div className="i-ph:folder-notch-open text-7xl mb-4 opacity-20" />
                <p className="text-lg">No templates found in this category</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-bolt-elements-textSecondary">
              <span className="font-medium">{filteredTemplates.length}</span> template
              {filteredTemplates.length !== 1 ? 's' : ''} available
            </div>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </DialogRoot>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: StarterTemplate;
  onSelect: (template: StarterTemplate) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 overflow-hidden transition-all hover:shadow-xl hover:border-bolt-elements-focus hover:scale-[1.02]"
      onClick={() => onSelect(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-48 w-full bg-gradient-to-br from-blue-500/20 via-teal-500/20 to-green-500/20 relative overflow-hidden flex items-center justify-center">
        <div className="text-6xl opacity-30">{TEMPLATE_CATEGORIES.find((c) => c.id === template.category)?.icon}</div>
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all backdrop-blur-sm">
            <div className="text-white text-sm font-medium px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
              Click to use template
            </div>
          </div>
        )}
        {template.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-yellow-500/90 text-yellow-900 border-yellow-600">
              <div className="i-ph:star-fill mr-1" />
              Featured
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            className={
              DIFFICULTY_COLORS[template.difficulty as keyof typeof DIFFICULTY_COLORS] || 'bg-gray-500/20 text-gray-400'
            }
          >
            {template.difficulty}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-bolt-elements-textPrimary mb-2">{template.name}</h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-4 line-clamp-2">{template.description}</p>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-bolt-elements-textTertiary mb-2">Features:</p>
            <div className="flex flex-wrap gap-1">
              {template.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {template.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded bg-bolt-elements-background-depth-3 text-bolt-elements-textTertiary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
