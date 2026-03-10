import React, { useState } from "react";
import API from "../services/api";

const AdminComplaintCard = ({ complaint, municipalities, refresh }) => {
  const [municipalityId, setMunicipalityId] = useState("");
  const complaintId = complaint.id || complaint._id;
  const cityName = complaint.city || "City not available";

  const assignComplaint = async () => {
    if (!municipalityId) return alert("Select municipality");

    try {
      await API.put("/admin/complaints/assign", {
        complaintId,
        municipalityId,
      });

      alert("Complaint assigned");
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const markSpam = async () => {
    try {
      await API.put(`/admin/complaints/spam/${complaintId}`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComplaint = async () => {
    try {
      await API.delete(`/admin/complaints/${complaintId}`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "15px",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 5px 0" }}>{complaint.user?.name}</h4>
          <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
            {complaint.user?.email}
          </p>
        </div>
        <span
          style={{
            background: "#fef3c7",
            color: "#92400e",
            padding: "5px 12px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {complaint.status}
        </span>
      </div>

      <p style={{ margin: "10px 0", lineHeight: "1.5" }}>
        {complaint.description}
      </p>

      {complaint.userImageURL && (
        <img
          src={complaint.userImageURL}
          alt="complaint"
          style={{
            width: "100%",
            maxHeight: "250px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          value={municipalityId}
          onChange={(e) => setMunicipalityId(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
          }}
        >
          <option value="">Select Municipality</option>
          {municipalities.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={assignComplaint}
          style={{
            padding: "8px 15px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Assign
        </button>

        <button
          onClick={markSpam}
          style={{
            padding: "8px 15px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Spam
        </button>

        <button
          onClick={deleteComplaint}
          style={{
            padding: "8px 15px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AdminComplaintCard;
