import StudyGroupDetail from "../components/StudyGroupDetail";

export default async function StudyGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StudyGroupDetail studyGroupId={id} />;
}
