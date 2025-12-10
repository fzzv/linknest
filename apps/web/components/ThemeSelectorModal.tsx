'use client';

import { Modal, Button } from '@linknest/ui';
import { useTranslations } from 'next-intl';
import { useTheme, type ThemeName } from '@/hooks/useTheme';
import ThemeRadioGroup from './ThemeRadioGroup';

type ThemeSelectorModalProps = {
  open: boolean;
  onClose: () => void;
};

const ThemeSelectorModal = ({ open, onClose }: ThemeSelectorModalProps) => {
  const t = useTranslations('ThemeSelector');
  const { theme, setTheme, themes } = useTheme();

  const handleSelectTheme = (value: ThemeName) => {
    setTheme(value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('title')}
      draggable
      dragHandleClassName="ln-modal-drag-handle"
      footer={(
        <Button variant="outline" color="primary" onClick={onClose}>
          {t('cancel')}
        </Button>
      )}
    >
      <div className="space-y-3">
        <div className="bg-base-100 pb-1 text-sm text-base-content/70 sticky top-0 leading-normal">
          {t('description')}
          <div className="pb-1 border-b border-base-300">
            {t('currentTheme')}: <span className="text-base-content text-md font-bold">{theme}</span>
          </div>
        </div>

        <ThemeRadioGroup value={theme} onChange={handleSelectTheme} themes={themes} />
      </div>
    </Modal>
  );
};

export default ThemeSelectorModal;
