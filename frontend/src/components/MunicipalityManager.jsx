import React, { useState } from "react";
import API from "../services/api";

const MunicipalityManager = ({ municipalities, refresh }) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const createMunicipality = async () => {
    if (!name || !city) return alert("Fill fields");

    try {
      await API.post("/admin/municipalities", { name, city });

      setName("");
      setCity("");

      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMunicipality = async (id) => {
    try {
      await API.delete(`/admin/municipalities/${id}`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2>Municipalities</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          placeholder="Municipality name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button onClick={createMunicipality}>Add</button>
      </div>

    </div>
  );
};

export default MunicipalityManager;
