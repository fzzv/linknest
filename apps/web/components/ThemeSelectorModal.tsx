'use client';

import { ResponsiveDialog, Button } from '@linknest/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';
import { useTheme, type ThemeName } from '@/hooks/useTheme';
import ThemeRadioGroup from './ThemeRadioGroup';

type ThemeSelectorModalProps = {
  open: boolean;
  onClose: () => void;
};

const ThemeSelectorModal = ({ open, onClose }: ThemeSelectorModalProps) => {
  const t = useTranslations('ThemeSelector');
  const { theme, setTheme, themes } = useTheme();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

  // 跳转到所选主题项的位置
  const scrollToTheme = useCallback(
    (themeName: ThemeName, behavior: ScrollBehavior = 'smooth') => {
      const target = contentRef.current
        ?.querySelector<HTMLElement>(`div[data-theme="${themeName}"]`)
        ?.closest('button');

      if (!(target instanceof HTMLElement)) return;
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior });
    },
    [],
  );

  // 打开弹窗后，跳转到所选主题项的位置
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open || wasOpen) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTheme(theme, 'auto');
      });
    });
  }, [open, scrollToTheme, theme]);

  const handleSelectTheme = (value: ThemeName) => {
    setTheme(value);
  };

  const handleResetTheme = () => {
    setTheme('dark');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTheme('dark', 'smooth');
      });
    });
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={t('title')}
      draggable
      dragHandleClassName="ln-modal-drag-handle"
      footer={(
        <>
          <Button variant="soft" color="primary" onClick={handleResetTheme}>
            {t('reset')}
          </Button>
          <Button variant="outline" color="primary" onClick={onClose}>
            {t('cancel')}
          </Button>
        </>
      )}
    >
      <div ref={contentRef} className="space-y-3">
        <div className="bg-base-100 pb-1 text-sm text-base-content/70 sticky top-0 leading-normal">
          {t('description')}
          <div className="pb-1 border-b border-base-300">
            {t('currentTheme')}
            :{' '}
            <button
              type="button"
              className="text-base-content text-md font-bold hover:underline underline-offset-2 cursor-pointer"
              onClick={() => scrollToTheme(theme, 'smooth')}
            >
              {theme}
            </button>
          </div>
        </div>

        <ThemeRadioGroup value={theme} onChange={handleSelectTheme} themes={themes} />
      </div>
    </ResponsiveDialog>
  );
};

export default ThemeSelectorModal;
