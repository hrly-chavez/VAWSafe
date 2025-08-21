export default function Page1({ formData, setFormData, next, cancel }) {
  return (
    <div>
      <h2>Page 1</h2>

      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName || ""}
        onChange={(e) =>
          setFormData({ ...formData, firstName: e.target.value })
        }
      />
      <br />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName || ""}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      />
      <br />

      <button onClick={cancel}>Cancel</button>
      <button onClick={next}>Continue</button>
    </div>
  );
}
