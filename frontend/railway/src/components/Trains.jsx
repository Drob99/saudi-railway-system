import React from "react";
import trainLogo from "../images/trainLogo.png";

const Trains = () => {
  // Train data defined locally
  const trains = [
    {
      trainid: 1,
      name_english: "TR 101",
      departuretime: "2025-05-14",
      capacity_economy: 200,
      capacity_econobusiness: 50,
      station: [
        { name: "Mumbai Central", CityName: "Mumbai" },
        { name: "Delhi Junction", CityName: "Delhi" },
      ],
    },
    {
      trainid: 2,
      name_english: "TR 202",
      departuretime: "2025-04-04",
      capacity_economy: 150,
      capacity_econobusiness: 30,
      station: [
        { name: "Chennai Central", CityName: "Chennai" },
        { name: "Bangalore City", CityName: "Bangalore" },
      ],
    },
    {
      trainid: 3,
      name_english: "TR 303",
      departuretime: "2025-03-20",
      capacity_economy: 100,
      capacity_econobusiness: 20,
      station: [
        { name: "Howrah Junction", CityName: "Kolkata" },
        { name: "Pune Junction", CityName: "Pune" },
      ],
    },
  ];

  return (
    <div className="trains-system">
      <h1 className="trains-system-title">Train Information</h1>
      <div className="trains-cards-container">
        {trains.length > 0 ? (
          trains.map((train) => (
            <div key={train.trainid} className="train-card-item">
              <div className="train-card-header">
                <img src={trainLogo} alt="Train Logo" className="train-card-logo" />
                <span className="train-card-number">{train.name_english}</span>
                <span className="train-card-date">{train.departuretime}</span>
              </div>
              <div className="train-card-body">
                <div className="train-card-capacity">
                  <p className="train-card-capacity-info">
                    Economy: {train.capacity_economy}
                  </p>
                  <p className="train-card-capacity-info">
                    Business: {train.capacity_econobusiness}
                  </p>
                </div>
                <div className="train-card-stations">
                  <h3>Stations:</h3>
                  <ul>
                    {train.station.map((station, index) => (
                      <li key={index}>
                        {station.name}, {station.CityName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button className="train-card-assign-button">Assign Staff</button>
            </div>
          ))
        ) : (
          <p className="trains-system-no-data">No trains available.</p>
        )}
      </div>
    </div>
  );
};

export default Trains;
