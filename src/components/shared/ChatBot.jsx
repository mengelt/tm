import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Fab,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { mockChatResponse } from '../../mock/api';

function parseMarkdown(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre style="background:#f5f5f5;padding:8px;border-radius:6px;overflow-x:auto;font-size:13px"><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f5f5f5;padding:2px 4px;border-radius:3px;font-size:13px">$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul style="margin:4px 0;padding-left:20px">${match}</ul>`);

  // Line breaks (double newline = paragraph break, single = <br>)
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: '85%',
          px: 2,
          py: 1.25,
          borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? '#fff' : 'text.primary',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
          '& pre': { my: 1 },
          '& ul': { my: 0.5 },
          '& li': { mb: 0.25 },
          '& code': {
            bgcolor: isUser ? 'rgba(255,255,255,0.15)' : undefined,
          },
        }}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
      />
    </Box>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm the **TMR Assistant**. I can help you with questions about the threat model review process, submission requirements, and more.\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await mockChatResponse(trimmed);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I wasn't able to process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) {
    return (
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          width: 56,
          height: 56,
        }}
        aria-label="Open chat assistant"
      >
        <ChatIcon />
      </Fab>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 1300,
        width: 400,
        height: 520,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          bgcolor: 'primary.main',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <SmartToyOutlinedIcon sx={{ mr: 1, fontSize: 22 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          TMR Assistant
        </Typography>
        <IconButton
          size="small"
          onClick={() => setOpen(false)}
          sx={{ color: '#fff' }}
          aria-label="Minimize chat"
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          bgcolor: '#fafafa',
        }}
      >
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5, mt: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Thinking...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          px: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: '#fff',
          flexShrink: 0,
        }}
      >
        <TextField
          inputRef={inputRef}
          multiline
          maxRows={3}
          fullWidth
          size="small"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '0.875rem',
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          sx={{ mb: 0.25 }}
          aria-label="Send message"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
