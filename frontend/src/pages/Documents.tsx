import { UploadZone } from '@/components/documents/UploadZone';
import { useAuth } from '@/lib/auth-context';

export function Documents() {
  const { user } = useAuth();

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Documents
          </h1>
          <p className="mt-2 text-sm text-ink-500 leading-relaxed">
            Upload documents to your knowledge base. PaperWhisper will index
            them so you can ask questions about their content.
          </p>
        </div>
        {user && <UploadZone userId={user.id} />}
      </div>
    </div>
  );
}
