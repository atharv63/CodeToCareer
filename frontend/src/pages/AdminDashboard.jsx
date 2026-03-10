import React, { useEffect, useState } from "react";
import API from "../services/api";
import AdminComplaintCard from "../components/AdminComplaintCard";
import MunicipalityManager from "../components/MunicipalityManager";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/admin/complaints");
      setComplaints(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const res = await API.get("/admin/municipalities");
      setMunicipalities(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchMunicipalities();
  }, []);

  // Filter Pending, Assigned, In Progress, and Resolved complaints
  const activeComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending" || complaint.status === "Assigned" || complaint.status === "In Progress" || complaint.status === "Resolved",
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <MunicipalityManager
        municipalities={municipalities}
        refresh={fetchMunicipalities}
      />

      <h2>Active Complaints ({activeComplaints.length})</h2>

      {activeComplaints.length === 0 ? (
        <p>No active complaints</p>
      ) : (
        activeComplaints.map((complaint) => (
          <AdminComplaintCard
            key={complaint._id}
            complaint={complaint}
            municipalities={municipalities}
            refresh={fetchComplaints}
          />
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
