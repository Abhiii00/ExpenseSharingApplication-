import { useState } from "react";

const UserManager = ({ users, onAddUser, onToggleUserStatus }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const created = await onAddUser(form);

      if (created) {
        setForm({
          name: "",
          username: "",
        });
      } else {
        setError("Could not create user. Please check the form and try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong while creating the user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, status) => {
    try {
      setUpdatingUserId(userId);
      setError("");

      const updated = await onToggleUserStatus(userId, status);

      if (!updated) {
        setError("Could not update user status. Please try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong while updating the user.");
    } finally {
      setUpdatingUserId("");
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
          {isSubmitting ? "Adding..." : "Add User"}
        </button>
      </form>

      {error ? <p className="empty-text">{error}</p> : null}

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
                disabled={updatingUserId === user.id}
                onClick={() =>
                  handleToggleStatus(
                    user.id,
                    user.status === "active" ? "inactive" : "active"
                  )
                }
              >
                {updatingUserId === user.id ? "Updating..." : user.status}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManager;
