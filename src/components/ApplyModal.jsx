import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export default function ApplyModal({ jobId, onClose }) {
  const [resumes, setResumes] = useState([]);
  const [selected, setSelected] = useState(null);

  async function loadResumes() {
    const res = await fetch(`${API_BASE}/api/resumes`, {
      credentials: "include",
    });

    const data = await res.json();
    setResumes(data);
  }

  async function applyJob() {
    if (!selected) {
      alert("Please select a resume");
      return;
    }

    const res = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        jobId,
        resumeId: selected,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Applied successfully!");
    onClose();
  }

  useEffect(() => {
    loadResumes();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Select Resume</h2>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {resumes.map(resume => (
            <label key={resume._id} className="flex gap-2 border p-2 rounded cursor-pointer">
              <input
                type="radio"
                name="resume"
                onChange={() => setSelected(resume._id)}
              />
              {resume.title || "Untitled Resume"}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={applyJob}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}