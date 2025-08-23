import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch total users
        const usersResponse = await fetch('/api/auth/users/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const usersData = await usersResponse.json();
        if (usersResponse.ok && usersData.success) {
          setTotalUsers(usersData.count);
        } else {
          throw new Error(usersData.message || 'Failed to fetch user count');
        }

        // Fetch contact messages
        const messagesResponse = await fetch('/api/contact/admin/contact-messages', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const messagesData = await messagesResponse.json();
        if (messagesResponse.ok && messagesData.success) {
          setMessages(messagesData.data);
        } else {
          throw new Error(messagesData.message || 'Failed to fetch messages');
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message);
        // If token is invalid or unauthorized, redirect to login
        if (err.message.includes('authorized') || err.message.includes('token')) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleReply = async (messageId, replyMessage) => {
    const token = localStorage.getItem('adminToken');
    if (!token || !replyMessage.trim()) return;

    try {
      const response = await fetch(`/api/contact/admin/contact-messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replyMessage }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the messages state to reflect the new reply
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === messageId ? { ...msg, replies: data.data.replies, status: data.data.status } : msg
          )
        );
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Reply error:', err);
      alert('Network error or server is unreachable');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.container}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={styles.container}>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Total Users</h2>
        <p style={styles.cardContent}>{totalUsers}</p>
      </div>

      <div style={styles.messagesSection}>
        <h2 style={styles.sectionTitle}>User Messages</h2>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} style={styles.messageCard}>
              <p><strong>From:</strong> {msg.senderName} ({msg.senderEmail})</p>
              <p><strong>Subject:</strong> {msg.subject}</p>
              <p><strong>Message:</strong> {msg.message}</p>
              <p><strong>Status:</strong> {msg.status}</p>
              <p style={styles.timestamp}>Received: {new Date(msg.createdAt).toLocaleString()}</p>

              {msg.replies.length > 0 && (
                <div style={styles.repliesSection}>
                  <h3>Replies:</h3>
                  {msg.replies.map((reply, index) => (
                    <div key={index} style={styles.replyItem}>
                      <p><strong>{reply.adminName}:</strong> {reply.message}</p>
                      <p style={styles.timestamp}>Replied: {new Date(reply.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                const replyInput = e.target.elements.replyInput;
                handleReply(msg._id, replyInput.value);
                replyInput.value = ''; // Clear input
              }} style={styles.replyForm}>
                <textarea
                  name="replyInput"
                  placeholder="Type your reply here..."
                  rows="3"
                  style={styles.replyTextarea}
                ></textarea>
                <button type="submit" style={styles.replyButton}>Send Reply</button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  heading: {
    color: '#333',
    fontSize: '2.5em',
    margin: 0,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease',
  },
  card: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  cardTitle: {
    color: '#555',
    fontSize: '1.2em',
    marginBottom: '10px',
  },
  cardContent: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#007bff',
  },
  messagesSection: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '1.8em',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  messageCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#fdfdfd',
  },
  timestamp: {
    fontSize: '0.8em',
    color: '#777',
    marginTop: '10px',
  },
  repliesSection: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px dashed #e0e0e0',
  },
  replyItem: {
    backgroundColor: '#e9f7ef',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
    borderLeft: '3px solid #28a745',
  },
  replyForm: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
  },
  replyTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    marginBottom: '10px',
    fontSize: '1em',
    resize: 'vertical',
  },
  replyButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease',
  },
};

export default Dashboard;
