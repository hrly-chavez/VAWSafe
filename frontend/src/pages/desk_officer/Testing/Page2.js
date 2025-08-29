export default function Page2({ formData, setFormData, next, back }) {
  return (
    <div>
      <h2>Page 2</h2>
      <input
        type="email"
        placeholder="Email"
        value={formData.email || ""}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <br />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone || ""}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <br />
      <button onClick={back}>Back</button>
      <button onClick={next}>Continue</button>
    </div>
  );
}
