import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import Stars from "../components/Stars";
import "./Dashboard.css";

const Dashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get("http://localhost:5000/stores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStores(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [token]);

  const handleRate = async (storeId, rating) => {
    try {
      // Check if user already rated
      const store = stores.find((s) => s.id === storeId);
      if (store.userRating) {
        await axios.put(
          `http://localhost:5000/ratings/${store.userRating.id}`,
          { rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/ratings",
          { store_id: storeId, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update UI
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId ? { ...s, userRating: { rating } } : s
        )
      );
      alert("Rating submitted!");
    } catch (err) {
      console.log(err);
      alert("Failed to submit rating");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="dashboard-container">
      {stores.map((store) => (
        <Card
          key={store.id}
          title={store.name}
          subtitle={store.address}
          details={[{ label: "Avg Rating", value: store.average_rating || 0 }]}
        >
          <div>
            <p>Your Rating:</p>
            <Stars
              rating={store.userRating?.rating || 0}
              onRate={(value) => handleRate(store.id, value)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
