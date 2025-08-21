export default function ({ formData, setFormData, back, cancel, submit }) {
  return (
    <div>
      <h2>Page 3</h2>
      <input
        type="text"
        placeholder="Address"
        value={formData.address || ""}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      <br />
      <input
        type="text"
        placeholder="City"
        value={formData.city || ""}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      />
      <br />
      <button onClick={back}>Back</button>
      <button onClick={cancel}>Cancel</button>
      <button onClick={submit}>Submit</button>
    </div>
  );
}
