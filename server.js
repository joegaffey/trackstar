const express = require("express");
const app = express();
app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/dev", (request, response) => {
  response.sendFile(__dirname + "/views/dev.html");
});

app.get("/editor", (request, response) => {
  response.sendFile(__dirname + "/views/editor.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});