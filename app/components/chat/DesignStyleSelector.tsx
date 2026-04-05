import { useEffect, useState } from 'react';
import { DialogRoot } from '~/components/ui/Dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';
import { Button } from '~/components/ui/Button';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Badge } from '~/components/ui/Badge';

interface DesignStyle {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail_url?: string;
  animation_preview_url?: string;
  prompt_template: string;
  parameters: {
    variance: number;
    motion: number;
    density: number;
  };
}

interface DesignStyleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStyle: (style: DesignStyle) => void;
}

const STYLE_CATEGORIES = [
  { id: 'all', label: 'All Styles', icon: '🎨' },
  { id: 'taste', label: 'Taste', icon: '✨' },
  { id: 'soft', label: 'Soft UI', icon: '🌸' },
  { id: 'minimalist', label: 'Minimalist', icon: '⬜' },
  { id: 'brutalist', label: 'Brutalist', icon: '⬛' },
  { id: 'modern', label: 'Modern', icon: '🔮' },
  { id: 'premium', label: 'Premium', icon: '💎' },
  { id: 'creative', label: 'Creative', icon: '🎪' },
  { id: 'corporate', label: 'Corporate', icon: '💼' },
  { id: 'editorial', label: 'Editorial', icon: '📰' },
];

const PLACEHOLDER_THUMBNAILS = {
  taste: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  soft: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  minimalist: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
  brutalist: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
  modern: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  premium: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  creative: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  corporate: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  editorial: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};

export function DesignStyleSelector({ isOpen, onClose, onSelectStyle }: DesignStyleSelectorProps) {
  const [styles, setStyles] = useState<DesignStyle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStyles();
    }
  }, [isOpen]);

  const loadStyles = async () => {
    try {
      setLoading(true);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase not configured');
        setLoading(false);
        return;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/design_styles?is_active=eq.true&order=category,name`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStyles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load design styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStyles =
    selectedCategory === 'all' ? styles : styles.filter((style) => style.category === selectedCategory);

  const handleSelectStyle = (style: DesignStyle) => {
    onSelectStyle(style);
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
            <div className="w-full max-w-6xl max-h-[90vh] bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-bolt-elements-borderColor">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-bolt-elements-textPrimary">Choose Your Design Style</h2>
            <button
              onClick={onClose}
              className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
            >
              <div className="i-ph:x text-xl" />
            </button>
          </div>
          <p className="text-sm text-bolt-elements-textSecondary">
            Select a design style to automatically enhance your prompt with professional design guidelines
          </p>
        </div>

        <div className="flex-1">
          <div className="px-6 pt-4 border-b border-bolt-elements-borderColor">
            <div className="flex gap-2 pb-4 overflow-x-auto">
              {STYLE_CATEGORIES.map((category) => (
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

          <ScrollArea className="h-[60vh] p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="i-ph:spinner animate-spin text-4xl text-bolt-elements-loader-progress" />
                  <p className="text-bolt-elements-textSecondary">Loading design styles...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStyles.map((style) => (
                  <div
                    key={style.id}
                    className="group cursor-pointer rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 overflow-hidden transition-all hover:shadow-lg hover:border-bolt-elements-focus hover:scale-[1.02]"
                    onClick={() => handleSelectStyle(style)}
                    onMouseEnter={() => setHoveredStyle(style.id)}
                    onMouseLeave={() => setHoveredStyle(null)}
                  >
                    <div
                      className="h-40 w-full relative overflow-hidden"
                      style={{
                        background:
                          style.thumbnail_url ||
                          PLACEHOLDER_THUMBNAILS[style.category as keyof typeof PLACEHOLDER_THUMBNAILS] ||
                          PLACEHOLDER_THUMBNAILS.modern,
                      }}
                    >
                      {hoveredStyle === style.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all">
                          <div className="text-white text-sm font-medium px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            Click to apply
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="backdrop-blur-sm bg-white/80">
                          {style.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-bolt-elements-textPrimary mb-2">{style.name}</h3>
                      <p className="text-sm text-bolt-elements-textSecondary mb-4 line-clamp-2">
                        {style.description}
                      </p>

                      <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-bolt-elements-background-depth-3">
                          <span className="text-bolt-elements-textSecondary">Variance:</span>
                          <span className="font-medium text-bolt-elements-textPrimary">
                            {style.parameters.variance}/10
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-bolt-elements-background-depth-3">
                          <span className="text-bolt-elements-textSecondary">Motion:</span>
                          <span className="font-medium text-bolt-elements-textPrimary">
                            {style.parameters.motion}/10
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-bolt-elements-background-depth-3">
                          <span className="text-bolt-elements-textSecondary">Density:</span>
                          <span className="font-medium text-bolt-elements-textPrimary">
                            {style.parameters.density}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredStyles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-bolt-elements-textSecondary">
                <div className="i-ph:paint-brush text-6xl mb-4 opacity-20" />
                <p>No styles found in this category</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-bolt-elements-textSecondary">
              <span className="font-medium">{filteredStyles.length}</span> style
              {filteredStyles.length !== 1 ? 's' : ''} available
            </div>
            <Button variant="secondary" onClick={onClose}>
              Cancel
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
