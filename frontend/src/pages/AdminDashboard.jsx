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

  // Filter only pending complaints
  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending",
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <MunicipalityManager
        municipalities={municipalities}
        refresh={fetchMunicipalities}
      />

      <h2>Pending Complaints ({pendingComplaints.length})</h2>

      {pendingComplaints.length === 0 ? (
        <p>No pending complaints</p>
      ) : (
        pendingComplaints.map((complaint) => (
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
