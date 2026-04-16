import { useState } from "react";

const createParticipant = () => ({
  userId: "",
  share: "",
  percentage: "",
  ratio: "",
});

const initialForm = {
  description: "",
  amount: "",
  splitType: "equal",
  payerIndex: 0,
  participants: [createParticipant(), createParticipant()],
};

const ExpenseForm = ({ onCreate, loading, users }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const activeUsers = users.filter((user) => user.status === "active");
  const filledParticipants = form.participants.filter((participant) => participant.userId);

  const getParticipantValueField = () => {
    if (form.splitType === "unequal") {
      return "share";
    }

    if (form.splitType === "percentage") {
      return "percentage";
    }

    if (form.splitType === "ratio") {
      return "ratio";
    }

    return "";
  };

  const getParticipantValueLabel = () => {
    if (form.splitType === "unequal") {
      return "Share";
    }

    if (form.splitType === "percentage") {
      return "Percentage";
    }

    if (form.splitType === "ratio") {
      return "Ratio";
    }

    return "Auto";
  };

  const getParticipantValueStep = () => {
    if (form.splitType === "ratio") {
      return "1";
    }

    return "0.01";
  };

  const getAvailableUsers = (currentIndex) => {
    const selectedUserIds = new Set(
      form.participants
        .filter((_, participantIndex) => participantIndex !== currentIndex)
        .map((participant) => participant.userId)
        .filter(Boolean)
    );

    return activeUsers.filter(
      (user) => !selectedUserIds.has(user.id) || user.id === form.participants[currentIndex].userId
    );
  };

  const updateParticipant = (index, field, value) => {
    setForm((current) => ({
      ...current,
      participants: current.participants.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, [field]: value } : participant
      ),
    }));
  };

  const addParticipant = () => {
    setForm((current) => ({
      ...current,
      participants: [...current.participants, createParticipant()],
    }));
  };

  const removeParticipant = (index) => {
    setForm((current) => {
      const participants = current.participants.filter(
        (_, participantIndex) => participantIndex !== index
      );

      return {
        ...current,
        participants,
        payerIndex:
          current.payerIndex === index
            ? 0
            : current.payerIndex > index
              ? current.payerIndex - 1
              : current.payerIndex,
      };
    });
  };

  const canSubmit = (() => {
    const participantIds = filledParticipants.map((participant) => participant.userId);
    const uniqueParticipants = new Set(participantIds);
    const valueField = getParticipantValueField();

    if (!form.amount.trim() || filledParticipants.length < 2) {
      return false;
    }

    if (uniqueParticipants.size !== participantIds.length) {
      return false;
    }

    if (!filledParticipants[form.payerIndex]?.userId) {
      return false;
    }

    if (valueField) {
      return filledParticipants.every((participant) => participant[valueField] !== "");
    }

    return true;
  })();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const valueField = getParticipantValueField();
      const participants = filledParticipants.map((participant) => {
        if (!valueField) {
          return { userId: participant.userId };
        }

        return {
          userId: participant.userId,
          [valueField]: participant[valueField],
        };
      });

      const created = await onCreate({
        description: form.description,
        amount: form.amount,
        splitType: form.splitType,
        payer: { userId: filledParticipants[form.payerIndex].userId },
        participants,
      });

      if (created) {
        setForm(initialForm);
      } else {
        setError("Could not save the expense. Please review the details and try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong while saving the expense.");
    }
  };

  return (
    <div className="card">
      <div className="section-title">
        <p>Create Expense</p>
        <h2>Add New Expense</h2>
      </div>

      <form className="expense-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Expense description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />

        <div className="two-column">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Total amount"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            required
          />

          <select
            value={form.splitType}
            onChange={(event) => setForm({ ...form, splitType: event.target.value })}
          >
            <option value="equal">Equal Split</option>
            <option value="unequal">Unequal Split</option>
            <option value="percentage">Percentage Split</option>
            <option value="ratio">Ratio Split</option>
          </select>
        </div>

        <div className="participants-head">
          <h3>Participants</h3>
          <button type="button" className="secondary-btn" onClick={addParticipant}>
            Add Participant
          </button>
        </div>

        {form.participants.map((participant, index) => (
          <div className="participant-row" key={index}>
            <select
              value={participant.userId}
              onChange={(event) => updateParticipant(index, "userId", event.target.value)}
              required
            >
              <option value="">Select participant</option>
              {getAvailableUsers(index).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            {getParticipantValueField() ? (
              <input
                type="number"
                step={getParticipantValueStep()}
                min="0"
                placeholder={getParticipantValueLabel()}
                value={participant[getParticipantValueField()]}
                onChange={(event) =>
                  updateParticipant(index, getParticipantValueField(), event.target.value)
                }
                required
              />
            ) : (
              <div className="auto-chip">Auto</div>
            )}

            <button
              type="button"
              className="danger-btn"
              disabled={form.participants.length <= 2}
              onClick={() => removeParticipant(index)}
            >
              Remove
            </button>
          </div>
        ))}

        <select
          value={form.payerIndex}
          onChange={(event) => setForm({ ...form, payerIndex: Number(event.target.value) })}
        >
          {filledParticipants.map((participant, index) => (
            <option value={index} key={index}>
              {activeUsers.find((user) => user.id === participant.userId)?.name || `Participant ${index + 1}`} paid
            </option>
          ))}
        </select>

        <button className="primary-btn" disabled={loading || !canSubmit}>
          {loading ? "Saving..." : "Save Expense"}
        </button>

        {error ? <p className="empty-text">{error}</p> : null}
      </form>
    </div>
  );
};

export default ExpenseForm;
