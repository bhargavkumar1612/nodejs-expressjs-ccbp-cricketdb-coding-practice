const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

//  serve and database initialization
const initializeDBAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log("DB error.", e);
    process.exit(0);
  }
};
initializeDBAndStartServer();

// get all players api
app.get("/players/", async (request, response) => {
  const allPlayersQuery = `
    select
    *
    from 
    cricket_team;
    `;
  const allPlayers = await db.all(allPlayersQuery);
  response.send(allPlayers);
});

// get player with given player id api
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select
    *
    from 
    cricket_team
    where player_id = ${playerId};
    `;
  const player = await db.all(getPlayerQuery);
  response.send(player);
});

//post a new player to the table api
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const insertPlayerQuery = `
    insert
    into cricket_team (player_name, jersey_number, role)
    values ('${playerName}','${jerseyNumber}','${role}');
    `;
  const dbResponse = await db.run(insertPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//update the player details at the given playerId api
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  console.log(playerId, playerName, jerseyNumber, role);
  const updatePlayerQuery = `
    update cricket_team 
    set player_name = '${playerName}',
    jersey_number= ${jerseyNumber},
    role="${role}" 
    where player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send(`Player Details Updated`);
});

// delete the given player Id

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
         DELETE FROM cricket_team
         WHERE
            player_id = ${playerId};
        `;
  await db.run(deleteQuery);
  response.send(`Player Removed`);
});
module.exports = app;