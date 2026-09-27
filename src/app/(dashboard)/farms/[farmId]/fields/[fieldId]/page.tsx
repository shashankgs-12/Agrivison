import { redirect } from "next/navigation";

export default async function FieldDetailsPage({
  params,
}: {
  params: Promise<{ farmId: string; fieldId: string }>;
}) {
  const { farmId } = await params;
  redirect(`/farms/${encodeURIComponent(farmId)}`);
}
