import React, { useState } from "react";

// Helper: Convert 24-hour format to 12-hour
const formatTo12Hour = (range) => {
  try {
    const [start, end] = range.split("–");
    const format = (t) => {
      if (!t) return "";
      const [h, m] = t.split(":");
      const hour = parseInt(h, 10);
      const suffix = hour >= 12 ? "PM" : "AM";
      const hr12 = hour % 12 || 12;
      return `${hr12}:${m}${suffix}`;
    };
    return `${format(start)}–${format(end)}`;
  } catch {
    return range;
  }
};

// Helper: Normalize and check if unavailability is still valid (timezone-safe)
const isFutureOrToday = (endDateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);
  return endDate >= today;
};

export default function WorkerCardSection({
  officials,
  loadingSW,
  selectedOfficials,
  setSelectedOfficials,
  searchTerm,
  setSearchTerm,
  fetchSocialWorkers,
}) {
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [expandedUnavailability, setExpandedUnavailability] = useState({});

  const toggleUnavailability = (id) => {
    setExpandedUnavailability((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatFriendlyDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Assign Worker</h3>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-3 mb-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchSocialWorkers(e.target.value);
          }}
          className="border px-3 py-2 rounded-md w-64 text-sm"
        />
      </div>

      {/* Worker Cards */}
      {loadingSW ? (
        <p className="text-sm text-gray-500">Loading workers...</p>
      ) : officials.length === 0 ? (
        <p className="text-sm text-gray-500">No workers found for this search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {officials.map((worker) => {
            const validUnavailable = (worker.unavailability || []).filter((u) =>
              isFutureOrToday(u.end_date)
            );
            const isExpanded = expandedUnavailability[worker.of_id] || false;

            return (
              <div
                key={worker.of_id}
                className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition ${
                  selectedOfficials.includes(worker.of_id)
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                {/* Header Info */}
                <div className="mb-2">
                  <h4 className="font-semibold text-blue-800">{worker.full_name}</h4>
                  <p className="text-xs text-gray-500">Contact: {worker.contact || "N/A"}</p>
                </div>

                {/* Weekly Availability */}
                <div className="flex justify-between mt-2 mb-2 text-[10px] text-center">
                  {daysOrder.map((day) => {
                    const time = worker.availability?.[day];
                    return (
                      <div
                        key={day}
                        className={`flex-1 mx-0.5 py-1 rounded ${
                          time
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <div className="font-semibold">{day.slice(0, 3)}</div>
                        <div>{time ? formatTo12Hour(time) : "—"}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Friendly Unavailability Section */}
                {validUnavailable.length > 0 && (
                  <div className="border-t pt-2 mt-2 text-xs">
                    <p className="font-semibold text-gray-700 mb-1">Unavailable Dates:</p>

                    {isExpanded ? (
                      <ul className="space-y-1">
                        {validUnavailable.map((u, idx) => (
                          <li key={idx} className="text-gray-600">
                            {formatFriendlyDate(u.start_date)} – {formatFriendlyDate(u.end_date)}{" "}
                            {u.reason && `(${u.reason})`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">
                        {formatFriendlyDate(validUnavailable[0].start_date)} –{" "}
                        {formatFriendlyDate(validUnavailable[0].end_date)}{" "}
                        {validUnavailable[0].reason && `(${validUnavailable[0].reason})`}
                        {validUnavailable.length > 1 && ` +${validUnavailable.length - 1} more`}
                      </p>
                    )}

                    {validUnavailable.length > 1 && (
                      <button
                        onClick={() => toggleUnavailability(worker.of_id)}
                        className="text-blue-600 text-[10px] mt-1 underline"
                      >
                        {isExpanded ? "Show Less" : "Show All"}
                      </button>
                    )}
                  </div>
                )}

                {/* Assign Button */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() =>
                      setSelectedOfficials((prev) =>
                        prev.includes(worker.of_id)
                          ? prev.filter((id) => id !== worker.of_id)
                          : prev.length < 3
                          ? [...prev, worker.of_id]
                          : prev
                      )
                    }
                    disabled={
                      !selectedOfficials.includes(worker.of_id) &&
                      selectedOfficials.length >= 3
                    }
                    className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                      selectedOfficials.includes(worker.of_id)
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {selectedOfficials.includes(worker.of_id)
                      ? "Selected"
                      : selectedOfficials.length >= 3
                      ? "Max 3 Selected"
                      : "Assign This Worker"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
