'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Upload, useMessage } from '@linknest/ui';
import { useTranslations } from 'next-intl';
import { importBookmarks, type ImportBookmarksResult } from '@/services/bookmarks';
import { formatFileSize } from '@linknest/utils';

type ImportBookmarksModalProps = {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
};

const ACCEPT_TYPES = ['text/html', 'application/json'];
const ACCEPT_EXTENSIONS = ['.html', '.htm', '.json'];

const isAllowedFile = (file: File) => {
  const name = file.name.toLowerCase();
  return (
    ACCEPT_EXTENSIONS.some((ext) => name.endsWith(ext)) ||
    ACCEPT_TYPES.includes(file.type)
  );
};

export function ImportBookmarksModal({ open, onClose, onImported }: ImportBookmarksModalProps) {
  const t = useTranslations('ImportBookmarks');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [message, messageHolder] = useMessage();
  const [insideMessage, insideMessageHolder] = useMessage();

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setIsImporting(false);
    }
  }, [open]);

  const handleSelectFile = (file?: File | null) => {
    if (!file) return;
    if (!isAllowedFile(file)) {
      insideMessage.error(t('invalidType'));
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      insideMessage.error(t('fileRequired'));
      return;
    }

    setIsImporting(true);
    try {
      const result: ImportBookmarksResult = await importBookmarks(selectedFile);
      message.success(
        t('success', {
          categories: result.importedCategories,
          links: result.importedLinks,
        }),
      );
      if (onImported) {
        await onImported();
      }
      onClose();
      setSelectedFile(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('failed');
      insideMessage.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const acceptAttr = useMemo(
    () => [...ACCEPT_EXTENSIONS, ...ACCEPT_TYPES].join(','),
    [],
  );

  return (
    <>
      {messageHolder}
      <Modal
        open={open}
        onClose={handleClose}
        title={t('title')}
        draggable
        dragHandleClassName="ln-modal-drag-handle"
        footer={(
          <>
            <Button variant="outline" color="primary" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button variant="custom" color="primary" isLoading={isImporting} onClick={handleUpload}>
              {t('start')}
            </Button>
          </>
        )}
      >
        {insideMessageHolder}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/2 px-4 py-3 text-sm text-white/80">
            {t('description')}
          </div>

          <Upload
            variant="dropzone"
            accept={acceptAttr}
            onFileSelect={handleSelectFile}
            description={t('dropDescription')}
            hint={t('hint')}
            className="border-white/10"
          >
            {t('dropTitle')}
          </Upload>

          {selectedFile ? (
            <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <div className="text-sm text-white">
                  <p className="font-semibold">{selectedFile.name}</p>
                  <p className="text-xs text-white/60">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs font-semibold text-white/70 transition hover:text-white"
              >
                {t('remove')}
              </button>
            </div>
          ) : (
            <p className="text-xs text-white/50">{t('filePlaceholder')}</p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default ImportBookmarksModal;
