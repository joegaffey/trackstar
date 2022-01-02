const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.json());

const trackList = {};
const track_1 = require('./public/tracks/test.json');
trackList[1] = track_1;

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

app.get("/editor", (request, response) => {
  response.sendFile(__dirname + "/public/editor.html");
});

app.get("/intro", (request, response) => {
  response.sendFile(__dirname + "/public/intro.html");
});

app.post("/tracks", (request, response) => {
  const track = request.body;
  track.id = Date.now();
  trackList[track.id] = track;
  response.send(track);
});

app.get("/tracks", (request, response) => {
  response.send(Object.values(trackList));
});

app.get("/tracks/:trackId", (request, response) => {
  const trackId = request.params.trackId;
  response.send(trackList[trackId]);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("TrackStar is listening on port " + listener.address().port);
});