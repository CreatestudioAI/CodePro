import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { DeployButton } from '~/components/deploy/DeployButton';
import { StarterTemplatesEnhanced } from '~/components/chat/StarterTemplatesEnhanced';
import { EnhancedAPIKeyManager } from '~/components/chat/EnhancedAPIKeyManager';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted: _chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [apiKeysOpen, setApiKeysOpen] = useState(false);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];

  const shouldShowButtons = activePreview;

  const handleSelectTemplate = (template: any) => {
    const prompt = `Create a ${template.name} with the following features: ${template.features.join(', ')}. ${template.description}`;
    toast.success(`Template selected: ${template.name}`);
    navigator.clipboard.writeText(prompt);
    toast.info('Template prompt copied to clipboard!');
  };

  return (
    <div className="flex items-center gap-1">
      {/* Templates Button */}
      <IconButton
        title="Starter Templates"
        onClick={() => setTemplatesOpen(true)}
        className="bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive"
      >
        <div className="i-ph:stack text-lg" />
      </IconButton>

      {/* API Keys Button */}
      <IconButton
        title="API Keys & Services"
        onClick={() => setApiKeysOpen(true)}
        className="bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive"
      >
        <div className="i-ph:key text-lg" />
      </IconButton>

      {/* Deploy Button */}
      {shouldShowButtons && <DeployButton />}

      {/* Debug Tools */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm">
          <button
            onClick={() =>
              window.open('https://github.com/stackblitz-labs/bolt.diy/issues/new?template=bug_report.yml', '_blank')
            }
            className="rounded-l-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1.5"
            title="Report Bug"
          >
            <div className="i-ph:bug" />
            <span>Report Bug</span>
          </button>
          <div className="w-px bg-bolt-elements-borderColor" />
          <button
            onClick={async () => {
              try {
                const { downloadDebugLog } = await import('~/utils/debugLogger');
                await downloadDebugLog();
              } catch (error) {
                console.error('Failed to download debug log:', error);
              }
            }}
            className="rounded-r-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1.5"
            title="Download Debug Log"
          >
            <div className="i-ph:download" />
            <span>Debug Log</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <StarterTemplatesEnhanced
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      <EnhancedAPIKeyManager isOpen={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
    </div>
  );
}
