import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MessageSquare, Plus, Send, X } from 'lucide-react'
import { messagesAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { ConversationItem, MessageItem, MessageContact } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { cn } from '@/lib/utils'

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString()
}

export default function Messages() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const [showContactPicker, setShowContactPicker] = useState(false)
  const [contacts, setContacts] = useState<MessageContact[]>([])

  const threadEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = () => {
    messagesAPI.getConversations()
      .then((res) => setConversations(parseListResponse(res.data)))
      .catch(() => showToast('Failed to load conversations', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadConversations() }, [])

  const openConversation = (id: number) => {
    setSelectedId(id)
    setMessagesLoading(true)
    messagesAPI.getMessages(id)
      .then((res) => setMessages(parseListResponse(res.data)))
      .catch(() => showToast('Failed to load messages', 'error'))
      .finally(() => setMessagesLoading(false))
    messagesAPI.markConversationRead(id).then(() => {
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)))
    }).catch(() => {})
  }

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!body.trim() || !selectedId) return
    setSending(true)
    try {
      const res = await messagesAPI.sendMessage(selectedId, body.trim())
      setMessages((prev) => [...prev, res.data])
      setBody('')
      loadConversations()
    } catch {
      showToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const openContactPicker = () => {
    messagesAPI.getContacts().then((res) => setContacts(parseListResponse(res.data))).catch(() => {})
    setShowContactPicker(true)
  }

  const startConversation = async (contactId: number) => {
    try {
      const res = await messagesAPI.createConversation(contactId)
      setShowContactPicker(false)
      await loadConversations()
      openConversation(res.data.id)
    } catch {
      showToast('Failed to start conversation', 'error')
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId)

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Direct messages between coaches and athletes"
        actions={<Button size="sm" magnetic={false} onClick={openContactPicker}><Plus size={16} /> New Message</Button>}
      />

      {showContactPicker && (
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-text">Start a Conversation</h3>
            <button onClick={() => setShowContactPicker(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
          </div>
          {contacts.length === 0 ? (
            <p className="font-body text-sm text-text-muted">No contacts available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => startConversation(c.id)}
                  className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-left hover:bg-white/5"
                >
                  <span className="font-body text-sm text-text">{c.name}</span>
                  <Badge>{c.role}</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]" style={{ minHeight: 500 }}>
        <Card className="h-fit p-3">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={24} /></div>
          ) : conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No conversations yet" description="Start a new message to reach a coach or athlete." />
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={cn(
                    'flex w-full flex-col gap-1 rounded-xl px-4 py-3 text-left transition-colors',
                    selectedId === c.id ? 'bg-accent text-text' : 'text-text-secondary hover:bg-white/5',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-body text-sm font-semibold">{c.other_user_name}</span>
                    {c.unread_count > 0 && <Badge variant="danger">{c.unread_count}</Badge>}
                  </div>
                  <p className="truncate font-body text-xs opacity-80">{c.last_message?.body || 'No messages yet'}</p>
                  <p className="font-body text-[10px] uppercase tracking-widest opacity-60">{timeAgo(c.updated_at)}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col p-0">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center p-12">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation on the left, or start a new one." />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <h3 className="font-display text-base font-bold text-text">{selectedConversation.other_user_name}</h3>
                <Badge>{selectedConversation.other_user_role}</Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-6" style={{ maxHeight: 420 }}>
                {messagesLoading ? (
                  <div className="flex justify-center py-10"><Spinner size={24} /></div>
                ) : messages.length === 0 ? (
                  <EmptyState icon={MessageSquare} title="No messages yet" description="Send the first message below." />
                ) : (
                  messages.map((m) => {
                    const isMine = m.sender === user?.id
                    return (
                      <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2.5',
                          isMine ? 'bg-accent text-text' : 'bg-white/5 text-text-secondary',
                        )}>
                          <p className="font-body text-sm">{m.body}</p>
                          <p className="mt-1 font-body text-[10px] uppercase tracking-widest opacity-60">{timeAgo(m.created_at)}</p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-border p-4">
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 font-body text-sm text-text outline-none focus:border-accent"
                />
                <Button type="submit" size="sm" magnetic={false} disabled={sending || !body.trim()}>
                  <Send size={14} />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
