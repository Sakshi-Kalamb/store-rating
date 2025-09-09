import React, { useState, useEffect } from "react";
import "./Stars.css";

const Stars = ({ rating = 0, onRate }) => {
  const [hover, setHover] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const handleClick = (value) => {
    setCurrentRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || currentRating) ? "filled" : ""}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleClick(star)}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
};

export default Stars;
