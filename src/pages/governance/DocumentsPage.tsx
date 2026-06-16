import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Folder,
  Search,
  Image,
  File,
  Download,
  X,
  Upload,
  Eye,
  Lock,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';

// ── Types ──────────────────────────────────────────────
interface DocumentRecord {
  id: string;
  title: string;
  description: string;
  folder: string;
  file_name: string;
  file_type: 'pdf' | 'image' | 'other';
  file_size_bytes: number;
  is_sensitive: boolean;
  uploaded_by: string;
  uploaded_at: string;
}

// ── Mock data ──────────────────────────────────────────
const mockDocuments: DocumentRecord[] = [
  {
    id: 'doc_001',
    title: 'Katiba ya Kwaya 2024',
    description: 'Updated choir constitution approved at AGM.',
    folder: 'constitution',
    file_name: 'katiba-kwaya-2024.pdf',
    file_type: 'pdf',
    file_size_bytes: 1_240_000,
    is_sensitive: false,
    uploaded_by: 'Amina Saleh',
    uploaded_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'doc_002',
    title: 'Minutes — Feb 14 Committee Meeting',
    description: 'Budget review and Easter concert planning.',
    folder: 'minutes',
    file_name: 'minutes-feb-14.pdf',
    file_type: 'pdf',
    file_size_bytes: 680_000,
    is_sensitive: true,
    uploaded_by: 'Grace Kimaro',
    uploaded_at: '2024-02-14T16:30:00Z',
  },
  {
    id: 'doc_003',
    title: 'Minutes — Jan 20 General Assembly',
    description: 'Election of new committee members.',
    folder: 'minutes',
    file_name: 'minutes-jan-20.pdf',
    file_type: 'pdf',
    file_size_bytes: 920_000,
    is_sensitive: false,
    uploaded_by: 'Grace Kimaro',
    uploaded_at: '2024-01-20T17:00:00Z',
  },
  {
    id: 'doc_004',
    title: 'Photo — Signed Attendance Sheet March',
    description: 'Scanned attendance sheet for March rehearsals.',
    folder: 'minutes',
    file_name: 'attendance-march.jpg',
    file_type: 'image',
    file_size_bytes: 2_100_000,
    is_sensitive: false,
    uploaded_by: 'John Mwamba',
    uploaded_at: '2024-03-28T09:15:00Z',
  },
  {
    id: 'doc_005',
    title: 'Easter Concert Budget Report',
    description: 'Income vs expenses for the Easter concert.',
    folder: 'reports',
    file_name: 'easter-budget.pdf',
    file_type: 'pdf',
    file_size_bytes: 450_000,
    is_sensitive: true,
    uploaded_by: 'Peter Mushi',
    uploaded_at: '2024-04-10T14:00:00Z',
  },
  {
    id: 'doc_006',
    title: 'Waraka — Askofu Mkuu, Pasaka',
    description: 'Circular from the Archbishop regarding Easter celebrations.',
    folder: 'circulars',
    file_name: 'waraka-pasaka.pdf',
    file_type: 'pdf',
    file_size_bytes: 310_000,
    is_sensitive: false,
    uploaded_by: 'Amina Saleh',
    uploaded_at: '2024-03-15T08:00:00Z',
  },
];

// ── Helpers ────────────────────────────────────────────
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
};

const getFileIcon = (type: DocumentRecord['file_type']) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

const getFileColor = (type: DocumentRecord['file_type']) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-600 [html[data-theme=dark]_&]:bg-red-900/30 [html[data-theme=dark]_&]:text-red-400';
    case 'image':
      return 'bg-blue-100 text-blue-600 [html[data-theme=dark]_&]:bg-blue-900/30 [html[data-theme=dark]_&]:text-blue-400';
    default:
      return 'bg-[var(--bg-hover)] text-[var(--text-muted)]';
  }
};

// ── Folder config ──────────────────────────────────────
const folderConfig = [
  { id: 'all', label: 'All Files', icon: Folder },
  { id: 'minutes', label: 'Meeting Minutes', icon: FileText },
  { id: 'constitution', label: 'Constitution', icon: FileText },
  { id: 'circulars', label: 'Circulars', icon: FileText },
  { id: 'reports', label: 'Reports', icon: FileText },
];

// ── Component ──────────────────────────────────────────
const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { choirMember } = useAuthStore();
  const { openBottomSheet, closeBottomSheet } = useUIStore();
  const toast = useToast();

  const canUpload = ['choir_leader', 'assistant_leader', 'secretary', 'super_admin'].includes(
    choirMember?.role || ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');

  // Filter documents
  const filteredDocs = useMemo(() => {
    let docs = mockDocuments;

    if (activeFolder !== 'all') {
      docs = docs.filter((d) => d.folder === activeFolder);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.file_name.toLowerCase().includes(q)
      );
    }

    return docs.sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [searchQuery, activeFolder]);

  // Count per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockDocuments.length };
    mockDocuments.forEach((d) => {
      counts[d.folder] = (counts[d.folder] || 0) + 1;
    });
    return counts;
  }, []);

  const handleUploadClick = () => {
    openBottomSheet(
      <UploadSheet
        onClose={closeBottomSheet}
        onUploaded={() => {
          closeBottomSheet();
          toast.success('Document uploaded successfully');
        }}
      />
    );
  };

  const handleDocClick = (doc: DocumentRecord) => {
    openBottomSheet(<DocumentDetailSheet doc={doc} onClose={closeBottomSheet} />);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">
            {t('documents.title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {filteredDocs.length} file{filteredDocs.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canUpload && (
          <Button size="sm" icon={<Upload className="h-4 w-4" />} onClick={handleUploadClick}>
            Upload
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search files by name…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      {/* Folder chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {folderConfig.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFolder === folder.id
                ? 'bg-[var(--action-primary)] text-white shadow-sm'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-light)]'
            }`}
          >
            <folder.icon className="h-4 w-4" />
            {folder.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeFolder === folder.id
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-subtle)]'
              }`}
            >
              {folderCounts[folder.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* File list */}
      {filteredDocs.length > 0 ? (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              hoverable
              padding="none"
              onClick={() => handleDocClick(doc)}
              className="cursor-pointer"
            >
              <div className="flex items-center p-4 gap-4">
                {/* File icon */}
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getFileColor(
                    doc.file_type
                  )}`}
                >
                  {getFileIcon(doc.file_type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm text-[var(--text-main)] truncate">
                      {doc.title}
                    </p>
                    {doc.is_sensitive && (
                      <Badge size="sm" variant="error">
                        <Lock className="h-3 w-3 mr-0.5" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                    </span>
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span className="uppercase font-bold">
                      {doc.file_type === 'image' ? 'IMG' : doc.file_type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-[var(--text-subtle)] flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="documents"
          title={searchQuery ? t('common.no_results') : t('empty.documents')}
          description={
            searchQuery
              ? 'Try a different search term.'
              : 'Upload PDFs or photos of meeting records here.'
          }
          action={
            searchQuery
              ? { label: t('common.clear'), onClick: () => setSearchQuery('') }
              : canUpload
              ? { label: 'Upload File', onClick: handleUploadClick }
              : undefined
          }
        />
      )}
    </div>
  );
};

// ── Upload Bottom Sheet ────────────────────────────────
interface UploadSheetProps {
  onClose: () => void;
  onUploaded: () => void;
}

const UploadSheet: React.FC<UploadSheetProps> = ({ onClose, onUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('minutes');
  const [isSensitive, setIsSensitive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];
    if (!allowed.includes(file.type)) {
      alert('Only PDF and image files are allowed.');
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB.');
      return;
    }

    setSelectedFile(file);
    // Auto-fill title from file name
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) return;

    setIsUploading(true);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 150));
      setUploadProgress(i);
    }

    setIsUploading(false);
    onUploaded();
  };

  const fileIsImage = selectedFile?.type.startsWith('image/');

  return (
    <div className="pt-2">
      <div className="mb-6 pr-8">
        <h2 className="text-xl font-semibold text-[var(--text-main)]">Upload Meeting Record</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          PDF or photo of meeting minutes, attendance sheet, etc.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">
        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-[var(--action-primary)] bg-[var(--action-primary)]/5'
              : 'border-[var(--border-primary)] hover:border-[var(--action-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center gap-4 text-left">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  fileIsImage
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {fileIsImage ? (
                  <Image className="h-6 w-6" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-main)] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatFileSize(selectedFile.size)} •{' '}
                  {fileIsImage ? 'Image' : 'PDF'}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)]"
              >
                <X className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[var(--text-subtle)] mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--text-main)]">
                Tap to select file
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                PDF or image • Max 10 MB
              </p>
            </>
          )}
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>Uploading…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--action-primary)] rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Title */}
        <Input
          label="Title"
          placeholder="e.g. Minutes — March 2024 Committee"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">
            Description (optional)
          </label>
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-surface)] p-3 text-sm min-h-[80px] text-[var(--text-main)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--action-primary)] transition-all"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief notes about this record…"
          />
        </div>

        {/* Folder selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">Folder</label>
          <div className="flex gap-2 flex-wrap">
            {['minutes', 'constitution', 'circulars', 'reports'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFolder(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  folder === f
                    ? 'bg-[var(--action-primary)] text-white'
                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Sensitive toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-hover)]">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[var(--text-muted)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-main)]">
                Mark as private
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Only leaders can view
              </p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-[var(--border-primary)] peer-checked:bg-[var(--action-primary)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isUploading}
            disabled={!selectedFile || !title}
            icon={<Upload className="h-4 w-4" />}
          >
            Upload
          </Button>
        </div>
      </form>
    </div>
  );
};

// ── Document Detail Bottom Sheet ───────────────────────
interface DocumentDetailSheetProps {
  doc: DocumentRecord;
  onClose: () => void;
}

const DocumentDetailSheet: React.FC<DocumentDetailSheetProps> = ({ doc }) => {
  return (
    <div className="pt-2">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getFileColor(
            doc.file_type
          )}`}
        >
          {getFileIcon(doc.file_type)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[var(--text-main)] leading-snug">
            {doc.title}
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            {doc.is_sensitive && (
              <Badge size="sm" variant="error">
                <Lock className="h-3 w-3 mr-0.5" />
                Private
              </Badge>
            )}
            <Badge size="sm" variant="default" className="uppercase">
              {doc.file_type === 'image' ? 'IMG' : doc.file_type}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4 mb-6">
        {doc.description && (
          <p className="text-sm text-[var(--text-muted)]">{doc.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
            <p className="text-[10px] text-[var(--text-subtle)] uppercase font-bold mb-1">
              File Name
            </p>
            <p className="text-sm text-[var(--text-main)] truncate">{doc.file_name}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
            <p className="text-[10px] text-[var(--text-subtle)] uppercase font-bold mb-1">
              Size
            </p>
            <p className="text-sm text-[var(--text-main)]">
              {formatFileSize(doc.file_size_bytes)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
            <p className="text-[10px] text-[var(--text-subtle)] uppercase font-bold mb-1">
              Uploaded
            </p>
            <p className="text-sm text-[var(--text-main)]">
              {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
            <p className="text-[10px] text-[var(--text-subtle)] uppercase font-bold mb-1">
              Uploaded by
            </p>
            <div className="flex items-center gap-2">
              <Avatar name={doc.uploaded_by} size="xs" />
              <p className="text-sm text-[var(--text-main)] truncate">{doc.uploaded_by}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
        <Button variant="outline" fullWidth icon={<Eye className="h-4 w-4" />}>
          Preview
        </Button>
        <Button variant="primary" fullWidth icon={<Download className="h-4 w-4" />}>
          Download
        </Button>
      </div>
    </div>
  );
};

export default DocumentsPage;
