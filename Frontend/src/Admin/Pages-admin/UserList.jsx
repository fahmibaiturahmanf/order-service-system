import React, { useEffect, useState } from 'react';
import './userList.css';
import axiosInstance from '../../utils/axiosInstance'; 

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/admin/users');
        setUsers(response.data.users); 
        setLoading(false);
      } catch (err) {
        if (err.response) {
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
          setError(err.response.data.message || `Error: ${err.response.status}`);
        } else if (err.request) {
          console.error("No response received:", err.request);
          setError("Tidak ada respons dari server. Pastikan backend berjalan dan dapat diakses.");
        } else {
          console.error("Error setting up request:", err.message);
          setError(`Error: ${err.message}`);
        }
        setLoading(false);
      }
    };

    fetchUsers(); 
  }, []); 

  if (loading) {
    return <div className="user-list-message">Loading users...</div>;
  }

  if (error) {
    return <div className="user-list-message error">Error loading users: {error}</div>;
  }

  return (
    <div className="user-list-container">
      <h2>Daftar Pengguna</h2>
      <table className="user-list-table">
        <thead>
          <tr>
            <th>ID Pengguna</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Nomor Telepon</th>
            <th>Tanggal Bergabung</th>
            <th>Peran</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td className={user.role.toLowerCase()}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;