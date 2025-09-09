import React from "react";
import "./Card.css";

const Card = ({ title, subtitle, details, children }) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {details && (
        <div className="card-details">
          {details.map((item, index) => (
            <p key={index}>
              <strong>{item.label}:</strong> {item.value}
            </p>
          ))}
        </div>
      )}
      <div className="card-children">{children}</div>
    </div>
  );
};

export default Card;
