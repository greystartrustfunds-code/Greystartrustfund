import React, { useState, useEffect, useRef } from 'react';
import { adminChatAPI } from '../services/adminApi';

const AdminChats = ({ setCurrentPage, setIsAdminAuthenticated }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('open');
  const messagesEndRef = useRef(null);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await adminChatAPI.getChats({ 
        status: statusFilter,
        limit: 50 
      });
      if (response.success) {
        setChats(response.data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAdminAuthenticated(false);
        setCurrentPage('admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchChatDetails = async (chatId) => {
    try {
      const response = await adminChatAPI.getChat(chatId);
      if (response.success) {
        setSelectedChat(response.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
      alert('Failed to load chat details');
    }
  };

  useEffect(() => {
    fetchChats();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectChat = (chat) => {
    fetchChatDetails(chat._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || !selectedChat) return;

    setSending(true);
    try {
      const response = await adminChatAPI.sendMessage(selectedChat._id, message.trim());
      if (response.success) {
        setSelectedChat(response.data);
        setMessage('');
        // Update chat in the list
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === selectedChat._id 
              ? { ...chat, lastMessageAt: new Date(), status: 'open' }
              : chat
          )
        );
      } else {
        alert(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateChatStatus = async (status) => {
    if (!selectedChat) return;

    try {
      const response = await adminChatAPI.updateChat(selectedChat._id, { status });
      if (response.success) {
        setSelectedChat(response.data);
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === selectedChat._id 
              ? { ...chat, status }
              : chat
          )
        );
        alert(`Chat ${status} successfully!`);
      } else {
        alert(response.message || 'Failed to update chat status');
      }
    } catch (error) {
      console.error('Error updating chat status:', error);
      alert('Failed to update chat status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAdminAuthenticated(false);
    setCurrentPage('admin-login');
    window.history.pushState(null, '', '/admin/login');
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
    const pageUrlMap = {
      'admin-dashboard': '/admin/dashboard',
      'admin-users': '/admin/users',
      'admin-transactions': '/admin/transactions',
      'admin-chats': '/admin/chats'
    };
    const url = pageUrlMap[page] || '/admin/dashboard';
    window.history.pushState(null, '', url);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getUnreadCount = (chat) => {
    return chat.messages?.filter(msg => 
      msg.senderModel === 'User' && !msg.isRead
    ).length || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                GreyStar Admin
              </h1>
            </div>
            <nav className="flex space-x-1 ml-8 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => navigateToPage('admin-dashboard')}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateToPage('admin-users')}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all"
              >
                Users
              </button>
              <button
                onClick={() => navigateToPage('admin-transactions')}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-600/50 transition-all"
              >
                Transactions
              </button>
              <button className="px-4 py-2 rounded-md bg-red-500/80 text-white font-medium shadow-sm transition-all">
                Chats
              </button>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-slate-700 bg-slate-800/50 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Support Chats</h2>
              <button
                onClick={fetchChats}
                disabled={loading}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Chats</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p>No chats found</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedChat?._id === chat._id
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {chat.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{chat.userId?.fullName || 'Unknown User'}</p>
                          <p className="text-xs text-gray-400">{chat.subject}</p>
                        </div>
                      </div>
                      {getUnreadCount(chat) > 0 && (
                        <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {getUnreadCount(chat)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedChat.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedChat.userId?.fullName || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-400">{selectedChat.userId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateChatStatus('closed')}
                      disabled={selectedChat.status === 'closed'}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-md"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleUpdateChatStatus('open')}
                      disabled={selectedChat.status === 'open'}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-md"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.senderModel === 'Admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.senderModel === 'Admin' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-slate-700 text-white border border-slate-600'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderModel === 'Admin' ? 'text-pink-100' : 'text-gray-400'
                        }`}>
                          {formatTime(msg.createdAt)}
                          {msg.senderModel === 'User' && msg.isRead && (
                            <span className="ml-2 text-green-400">✓</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>No messages yet</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedChat.status !== 'closed' && (
                <div className="border-t border-slate-700 p-4 bg-slate-800/30">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={sending}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-2xl font-medium transition-all flex items-center space-x-2"
                    >
                      {sending ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">Select a Chat</h3>
                <p>Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;