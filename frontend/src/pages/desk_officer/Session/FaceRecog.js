export default function FaceRecog({ cancel, next }) {
  return (
    <div>
      Face Recog Goes Here
      <button
        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        onClick={cancel}
      >
        Cancel
      </button>
      <button
        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
        onClick={next}
      >
        Continue
      </button>
    </div>
  );
}
