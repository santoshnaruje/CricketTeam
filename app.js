const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;

let convertDbObjectToResponseObject = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

const dbPath = path.join(__dirname, "cricketTeam.db");

const createAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at localhost");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
  }
};
createAndStartServer();

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  let { playerName, jerseyNumber, role } = playerDetails;

  const postQuery = `
  INSERT INTO
  cricket_team(player_name,jersey_number,role)
  VALUES('${playerName}',${jerseyNumber},'${role}');`;

  const dbResponse = await db.run(postQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/", async (request, response) => {
  const playersQuery = `select * from cricket_team;`;
  let playersArray = await db.all(playersQuery);

  response.send(
    playersArray.map((eachPlayer) => {
      return convertDbObjectToResponseObject(eachPlayer);
    })
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const playerQuery = `
  SELECT
   * 
   FROM
   cricket_team
   WHERE
   player_id='${playerId}'
  ;`;
  let playerDetail = await db.get(playerQuery);

  const player = await convertDbObjectToResponseObject(playerDetail);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  let { playerName, jerseyNumber, role } = playerDetails;

  const putQuery = `
   UPDATE cricket_team
   SET
   player_name='${playerName}',
   jersey_number=${jerseyNumber},
   role='${role}'
   WHERE
   player_id='${playerId}'

  `;

  const dbResponse = await db.run(putQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const playerQuery = `
  DELETE FROM
  cricket_team
   WHERE
   player_id='${playerId}'
  ;`;
  let playerDetail = await db.run(playerQuery);

  response.send("Player Removed");
});

module.exports = app;
