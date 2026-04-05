import { useState } from "react";

const UserManager = ({ users, onAddUser, onToggleUserStatus }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const created = await onAddUser(form);

    if (created) {
      setForm({
        name: "",
        username: "",
      });
    }
  };

  return (
    <div className="card">
      <div className="section-title">
        <p>Users</p>
        <h2>Create User</h2>
      </div>

      <form className="expense-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
        />
        <button className="primary-btn" type="submit">
          Add User
        </button>
      </form>

      <div className="user-list top-gap">
        {users.length === 0 ? (
          <p className="empty-text">No users added yet.</p>
        ) : (
          users.map((user) => (
            <div className="user-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <p>@{user.username}</p>
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  onToggleUserStatus(user.id, user.status === "active" ? "inactive" : "active")
                }
              >
                {user.status}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManager;
