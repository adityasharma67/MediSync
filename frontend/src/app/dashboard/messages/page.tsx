'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, Card, Input } from '@/components/ui/index';
import { apiClient } from '@/lib/api';
import { Conversation } from '@/types';
import useAuthStore from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const socketRef = useRealtime(user?._id);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient.getConversations().then(({ data }) => {
      setConversations(data);
      if (data[0]?._id) {
        setActiveConversationId(data[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!socketRef.current || !activeConversationId) return;
    socketRef.current.emit('chat:join', activeConversationId);
  }, [activeConversationId, socketRef]);

  const activeConversation = conversations.find((conversation) => conversation._id === activeConversationId);

  const handleSend = async () => {
    if (!activeConversationId || !message.trim()) return;

    const { data } = await apiClient.sendMessage(activeConversationId, {
      text: message,
      attachments: [],
    });

    setConversations((current) =>
      current.map((conversation) => (conversation._id === activeConversationId ? data : conversation))
    );
    setMessage('');
  };

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => setActiveConversationId(conversation._id)}
                className={`w-full rounded-xl border p-4 text-left ${
                  activeConversationId === conversation._id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {conversation.participants.map((participant) => participant.name).join(', ')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {conversation.messages[conversation.messages.length - 1]?.text || 'No messages yet'}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[70vh] flex-col">
          <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Doctor-Patient Chat</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Async chat supports shared report links and stored conversation history.
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-auto py-6">
            {activeConversation?.messages.map((entry, index) => (
              <div key={`${entry.createdAt}-${index}`} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/30">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{entry.senderRole}</p>
                <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">{entry.text || 'Attachment shared'}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message or include a report link" />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
