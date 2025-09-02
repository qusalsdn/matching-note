import ChatContent from "../components/ChatContent";

export default async function ChatsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ChatContent id={id} />;
}
