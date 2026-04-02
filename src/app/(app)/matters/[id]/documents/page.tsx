import { listDocuments } from "@/server/actions/documents";
import { DocumentList } from "@/components/matter/document-list";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documents = await listDocuments(id);

  return <DocumentList matterId={id} documents={documents} />;
}
