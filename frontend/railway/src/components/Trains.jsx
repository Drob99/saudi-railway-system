import React from "react";
import trainLogo from "../images/trainLogo.png";

const Trains = () => {
  // Train data defined locally
  const trains = [
    // {
    //   "trainid": 1,
    //   "name_english": "HHR100",
    //   "name_arabic": "قطار الحرمين السريع",
    //   "departuretime": "2024-12-10T05:00:00.000Z",
    //   "arrivaltime": "2024-12-10T09:00:00.000Z",
    //   "originstationid": 1,
    //   "destinationstationid": 2,
    //   "availableseats": "399"
    // },
    {
      id: 1,
      number: "TR 101",
      date: "2025-05-14",
      source: "Mumbai",
      destination: "Delhi",
      economyCapacity: 200,
      businessCapacity: 50,
      stations: [
        { name: "Mumbai Central", city: "Mumbai" },
        { name: "Delhi Junction", city: "Delhi" },
      ],
    },
    {
      id: 2,
      number: "TR 202",
      date: "2025-04-04",
      source: "Chennai",
      destination: "Bangalore",
      economyCapacity: 150,
      businessCapacity: 30,
      stations: [
        { name: "Chennai Central", city: "Chennai" },
        { name: "Bangalore City", city: "Bangalore" },
      ],
    },
    {
      id: 3,
      number: "TR 303",
      date: "2025-03-20",
      source: "Kolkata",
      destination: "Pune",
      economyCapacity: 100,
      businessCapacity: 20,
      stations: [
        { name: "Howrah Junction", city: "Kolkata" },
        { name: "Pune Junction", city: "Pune" },
      ],
    },
  ];

  return (
    <div className="trains-system">
      <h1 className="trains-system-title">Train Information</h1>
      <div className="trains-cards-container">
        {trains.length > 0 ? (
          trains.map((train) => (
            <div key={train.id} className="train-card-item">
              <div className="train-card-header">
                <img src={trainLogo} alt="Train Logo" className="train-card-logo" />
                <span className="train-card-number">{train.number}</span>
                <span className="train-card-date">{train.date}</span>
              </div>
              <div className="train-card-body">
                <div className="train-card-capacity">
                  <p className="train-card-capacity-info">
                    Economy: {train.economyCapacity}
                  </p>
                  <p className="train-card-capacity-info">
                    Business: {train.businessCapacity}
                  </p>
                </div>
                <div className="train-card-stations">
                  <h3>Stations:</h3>
                  <ul>
                    {train.stations.map((station, index) => (
                      <li key={index}>
                        {station.name}, {station.city}
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
