import React, { useState, useRef, useEffect } from "react";

export default function Evidences() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = [];

    for (let file of selected) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`❌ ${file.name} is larger than 10 MB`);
        continue;
      }
      valid.push({
        id: `${file.name}-${file.lastModified}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (valid.length) {
      setError("");
      setFiles((prev) => [...prev, ...valid]);
    }

    // reset input so same file can be chosen again
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [files]);

  return (
    <div className="p-4 bg-white rounded-lg shadow w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Upload Photos</h2>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        onChange={handleChange}
        className="block w-full mb-2 text-sm text-gray-600 
                   file:mr-2 file:py-1 file:px-3
                   file:rounded-md file:border-0
                   file:text-sm file:font-medium
                   file:bg-blue-600 file:text-white
                   hover:file:bg-blue-700 cursor-pointer"
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f) => (
            <div key={f.id} className="relative">
              <img
                src={f.preview}
                alt={f.file.name}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemove(f.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
