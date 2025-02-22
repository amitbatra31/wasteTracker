import "../app.css";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useEffect, useState } from "react";
import {
  HomeOutlined,
  PinDropSharp,
  Room,
  Star,
  StarBorder,
  MyLocation,
} from "@material-ui/icons";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./Register";
import Login from "./Login";
import { Redirect } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";
//@ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = MapboxWorker;
function Maps(props) {
  const myStorage = window.localStorage;

  const [currentUsername, setCurrentUsername] = useState(
    myStorage.getItem("user")
  );
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const [viewport, setViewport] = useState({
    latitude: 47.040182,
    longitude: 17.071727,
    zoom: 15,
  });
  const [liveviewport, setLiveviewport] = useState({
    latitude: 47.040182,
    longitude: 17.071727,
  });
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const url = "http://localhost:8000/";
  // const url = "https://reactwastetracker.herokuapp.com/";

  const handleMarkerClick = async (id, lat, long) => {
    setCurrentPlaceId(id);
    console.log("handle clicked");
    let res = await axios.get(
      url+"api/volunteer"
    );
    let allVolunteers = res.data;


    let volunteerOrNot = false;
    console.log("pinId : ", id);
    console.log("currentUsername : ", currentUsername);
    for (let i = 0; allVolunteers && i < allVolunteers.length; i++) {
      if (
        allVolunteers[i].username === currentUsername &&
        allVolunteers[i].pinId === id
      ) {
        volunteerOrNot = true;
        break;
      }
    }

    console.log("volunteerOrNot : ", volunteerOrNot);

    if (volunteerOrNot) setvolunteerButton("Cancel volunteer");
    else setvolunteerButton("Be a volunteer");

    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lat: latitude,
      long: longitude,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post(
        url+"api/pins",
        newPin
      );
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSeeAllVol = async (e) => {
    e.preventDefault();
    console.log("clicked the see all volunteers button");
    props.history.push("/seeallvolunteers");
  };

  const [volunteerButton, setvolunteerButton] = useState("Be a volunteer");
  const handleVolSubmit = async (e) => {
    e.preventDefault();
    console.log(e);
    const newVol = {
      pin_id: currentPlaceId,
      username: myStorage.getItem("user"),
    };

    try {
      const res = await axios.post(
        url+"api/volunteer",
        newVol
      );
      console.log(res.data);
      if (res.data === "Volunteer added successfully") {
        setvolunteerButton("Cancel volunteer");
      } else if (res.data === "You are not volunteer now") {
        setvolunteerButton("Be a volunteer");
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get(
          URL+"api/pins"
        );
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleLogout = async () => {
    const userDetails = {
      username: myStorage.getItem("user"),
    };
    await axios.post(
      url + "api/users/logout"
    );
    setCurrentUsername(null);
    myStorage.removeItem("user");
  };

  // var liveLat =
  if ("geolocation" in navigator) {
    console.log("geolocation is available");
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("Longitude is ", position.coords.longitude);
      console.log("Latitude is ", position.coords.latitude);
      setLiveviewport({
        ...liveviewport,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setViewport({
        ...viewport,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  } else {
    console.log("geolocation is unavailable");
  }

  return (
    <div style={{ height: "100vh", width: "100%", overflow:"hidden"}}>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoiYW1pdGJhdHJhMzEiLCJhIjoiY2t2MmQzbnh0MDI5dzJ5bDdvbDExand4MiJ9.vJaVz5di-IFq3uJd_eCC2Q"
        width="100%"
        height="100%"
        transitionDuration="200"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={(viewport) => setViewport(viewport)}
        onDblClick={currentUsername && handleAddClick}
      >
        <Marker
          latitude={liveviewport.latitude}
          longitude={liveviewport.longitude}
          offsetLeft={-3.5 * viewport.zoom}
          offsetTop={-7 * viewport.zoom}
        >
          <MyLocation
            style={{
              fontSize: 3 * viewport.zoom,
              color: "red",
              cursor: "pointer",
            }}
            onClick={() =>
              handleMarkerClick(
                "Live Geolocation",
                liveviewport.latitude,
                liveviewport.longitude
              )
            }
          />
        </Marker>

        {currentPlaceId == "Live Geolocation" && (
          <Popup
            key={currentPlaceId}
            latitude={liveviewport.latitude}
            longitude={liveviewport.longitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setCurrentPlaceId(null)}
            anchor="left"
          >
            <div
              style={{
                maxHeight: "70px",
                backgroundColor: "black",
                color: "white",
                paddingLeft: "5px",
                paddingTop: "5px",
              }}
            >
              Your Location
            </div>
          </Popup>
        )}

        {pins.map((p) => (
          <>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-3.5 * viewport.zoom}
              offsetTop={-7 * viewport.zoom}
            >
              <Room
                style={{
                  fontSize: 3 * viewport.zoom,
                  color:
                    currentUsername === p.username ? "tomato" : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                key={p._id}
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setCurrentPlaceId(null)}
                anchor="left"
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Description</label>
                  <p className="desc">{p.desc}</p>
                  <label>Garbage Level</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                  <form onSubmit={handleVolSubmit}>
                    <input type="hidden" name="pin_id" value={p._id}></input>

                    <button
                      name="volunteer"
                      type="submit"
                      className="submitButton"
                    >
                      {volunteerButton}
                    </button>
                  </form>

                  <form onSubmit={handleSeeAllVol}>
                    <button
                      name="volunteer"
                      type="submit"
                      className="submitButton"
                    >
                      See all volunteers
                    </button>
                  </form>
                </div>
              </Popup>
            )}
          </>
        ))}
        {newPlace && (
          <>
            <Marker
              latitude={newPlace.lat}
              longitude={newPlace.long}
              offsetLeft={-3.5 * viewport.zoom}
              offsetTop={-7 * viewport.zoom}
            >
              <Room
                style={{
                  fontSize: 3 * viewport.zoom,
                  color: "tomato",
                  cursor: "pointer",
                }}
              />
            </Marker>
            <Popup
              latitude={newPlace.lat}
              longitude={newPlace.long}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setNewPlace(null)}
              anchor="left"
            >
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Details</label>
                  <input
                    placeholder="Enter a title"
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label>Description</label>
                  <textarea
                    placeholder="Say us something about this place."
                    onChange={(e) => setDesc(e.target.value)}
                  />
                  <label>Garbage Level</label>
                  <select onChange={(e) => setStar(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton" >
                    Add Pin
                  </button>
                </form>
              </div>
            </Popup>
          </>
        )}
        {currentUsername ? (
          <div className="buttons" id="buttonDiv">
            <button className="button logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="buttons" id="buttonDiv">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUsername={setCurrentUsername}
            myStorage={myStorage}
          />
        )}
      </ReactMapGL>
    </div>
  );
}

export default Maps;
