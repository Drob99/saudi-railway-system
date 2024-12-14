import React from "react";
import trainLogo from "../images/trainLogo.png";
import { useQuery } from "react-query";
import axios from "axios";
import { API } from "../utils/api";

const Trains = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["SearchTrains"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API}/v1/trains/search?originStationId=1&destinationStationId=2&departureDate=2024-12-10%2008:00:00&class=Economy`
      );
      return data;
    },
  });
  
  if (isLoading) return <div>Loading</div>;

  if (error) return <div>{error.message ?? "error"}</div>;

  const trains = data.data;

  return (
    <div className="trains-system">
      <h1 className="trains-system-title">Train Information</h1>
      <div className="trains-cards-container">
        {trains.length > 0 ? (
          trains.map((train) => (
            <div key={train["trainid"]} className="train-card-item">
              <div className="train-card-header">
                <img
                  src={trainLogo}
                  alt="Train Logo"
                  className="train-card-logo"
                />
                <span className="train-card-number">
                  {train["name_english"]}
                </span>
                <span className="train-card-date">
                  {train["departuretime"]}
                </span>
              </div>
              <div className="train-card-body ">
                <div className="train-card-capacity">
                  <p className="train-card-capacity-info">
                    Economy: {train["economycapacity"]}
                  </p>
                  <p className="train-card-capacity-info">
                    Business: {train["businesscapacity"]}
                  </p>
                </div>
                <div className="train-card-stations">
                  <h3>Stations:</h3>
                  <ul>
                    {/* {train.stations.map((station, index) => (
                      <li key={index}>
                        {station.name}, {station.city}
                      </li>
                    ))} */}
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
