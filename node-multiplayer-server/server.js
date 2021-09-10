var express = require("express"); 
var app = express();
var bodyParser = require("body-parser");
var path = require("path")
var uuid = require('uuid-random');

const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');

// Running our server on port 8080
var PORT  = process.env.PORT || 8080

var server = app.listen(PORT, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', 'localhost/', port);
});

//app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

var io = require('socket.io')(server);

app.use(express.static(path.join(__dirname,"/build")));// Invoking our middleware
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var roomsData = {

}

var playersData = {

}

var hostPassword = "1234"

var currentQuestionNum = 0

io.on('connection', (client) => {

  console.log("New client connected");

  // console.log(client)

  //Create Player ID
  client.on("CreatePlayerID", (data) => {
    createPlayerID(client)
  })

  //Notify Player Connected with
  client.on("PlayerConnected", (playerData) => {
    console.log("Socket ID is " + client.id)
    playersData["" + client.id] = {playerID: playerData.playerID, username: playerData.username}
    console.log("Current Players Data...")
    console.log(playersData)
    sendCurrentClientID(client)
  })

  

  //DisconnectPlayer (NOT USED CURRENTLY)
  client.on("DisconnectPlayer", (playerData) => {
    console.log("Player Data: " + playerData)
  })

  //Create Room with ID (for Game Host)
  client.on("CreateRoomWithID", (hostRoomData) => {

    if(hostRoomData.password == hostPassword){

      console.log("Creating Room...")
      console.log(hostRoomData)
      let roomID = generateRandomInterger(1000,10000)
      console.log("New Room ID: " + roomID)
      client.join("" + roomID)

      console.log(client.rooms)

      playersData["" + client.id].hostname = hostRoomData.username
      // playersData["" + client.id].nickname = "Trivia Room"

      // playersData["" + client.id].isAlive = true;

      //Set Server player data to have room
      assignRoomToPlayer(client.id, roomID)

      successfullyCreatedRoom(client, roomID, "Trivia Room", hostRoomData.username)
    } else {
      failedCreateRoom(client)
    }
  })

  //Send Trivia Questions to Client
  client.on("GetQuestions", () => {
    sendQuestionsToPlayer(client)
  })

  //Send Trivia Questions to All Players
  client.on("SendCurrentQuestion", (currentQuestionNumber) => {
    console.log("Send Current Question")
    console.log(currentQuestionNumber)
    currentQuestionNum = currentQuestionNumber
    sendQuestionNumberToAllPlayers(client)
  })

  client.on("GetGameRoomInfo", (roomID) => {
    console.log("Getting Room Info...")
    sendRoomInfoToPlayer(roomID, client)
  })

  client.on("CheckIfRoomIDIsValid", (roomID) => {
    verifyRoomID(client, roomID)
  })

  client.on("GetRoomStatus", (roomID) => {
    verifyRoomStatus(client, roomID)
  })

  client.on("SendGameStatusToAllPlayers", (statusData) => {
    console.log("Sending Game Status To All Players...")
    console.log(statusData)
    console.log(roomsData[statusData.roomID])
    sendGameStatusToAllPlayers(client, statusData)
  })


  //Create Room with ID (for Game Host)
  client.on("GetPlayersInRoom", (roomID) => {
    updatePlayersInRoom(client, roomID)
    getPlayersInRoom(client, roomID)
  })

  //Create Room with ID (for Game Host)
  client.on("JoinRoomWithID", (joinRoomData) => {
    console.log("Joining Room with ID... " +  joinRoomData.roomID)

    //If Room Exists...
    if(roomsData["" + joinRoomData.roomID]) {

      //TODO: Add logic to confirm that player joined room
      roomsData[joinRoomData.roomID]["players"].push(joinRoomData.username)

      console.log(roomsData[joinRoomData.roomID])

      client.join("" + joinRoomData.roomID)

      playersData["" + client.id].username = joinRoomData.username

      // playersData["" + client.id].isAlive = true;

      //Set Server player data to have room
      assignRoomToPlayer(client.id, joinRoomData.roomID)

      console.log(client.rooms)
      updatePlayersInRoom(client, joinRoomData.roomID)
      successfulyJoinedRoom(client, joinRoomData.roomID)
    } 
    else {
      failedJoiningRoom(client)
    }
  })

  //Player (Host) Started Game
  client.on('StartGame', () => {
    //Send Message to all other players that game started
    gameStarted(client)
  });

  //Receive Player Status from Player
  client.on('PlayerStatusUpdated', (playerStatus) => {
    playersData["" + client.id].status = playerStatus
    console.log(playerStatus)
    console.log(playersData["" + client.id])
    console.log(playersData)

    //Send
    sendStatusToPlayer(client)
  });











  //Player Disconnecting...
  client.on('LeaveRoom', () => {
    //remove player from room and notify other players (and update server data)
    removePlayersRoomData(client)
  });

  //Player Disconnecting...
  client.on('disconnecting', () => {
    const rooms = Object.keys(client.rooms);
    console.log("Client disconnecting...");
    console.log(rooms)
  });

  //Player Disconnected
  client.on('disconnect', function(data) {
      console.log("Client disconnected");
      console.log("Client Data: " + data)
      console.log(client.rooms)
      //If Player was in any rooms, remove them from room and notify other players (and update server data)
      removePlayersRoomData(client)

      delete playersData["" + client.id]

      console.log(playersData)
  });


});

//SOCKET METHODS

//Create UUID for Player
function createPlayerID(client){
  let playerID = uuid();
  let username = uniqueNamesGenerator({ dictionaries: [colors, names] });
  var userData = {playerID: playerID, username: username}
  console.log(username)
  client.emit("SetPlayerID", userData)
}

// generate an integer in the range [x, y)
function generateRandomInterger(x,y){
  return Math.floor(x + (y - x) * Math.random());
}

//Create Room for Host
function successfullyCreatedRoom(client, roomIDValue, roomNameValue, hostUsername){
  roomsData[roomIDValue] = { players: [], roomName: roomNameValue, roomID: roomIDValue}
  console.log("Creating Room....")
  console.log(roomsData[roomIDValue])
  client.emit("CreatedRoomWithID", {roomID: roomIDValue, roomName: roomNameValue})
}

//Message all other players of updates of player in rom
function updatePlayersInRoom(client, roomID){
  console.log("Updated Players in " + roomID)
  console.log(client.rooms)
  client.in(""+roomID).emit("UpdatePlayersInRoom", roomsData[roomID])
  //Check to see if room is empty
  checkIfRoomEmpty(roomID)
}

function getPlayersInRoom(client, roomID){
  client.emit("Getting Players in Room ", roomsData[roomID])
  client.emit("GetPlayersInRoom", roomsData[roomID])
}

function successfulyJoinedRoom(client, roomID){
  console.log("Successfully Joined Room " + roomID)
  client.emit("Successfully Joined Room ", roomsData[roomID])
  client.emit("SuccessfullyJoinedRoom", roomsData[roomID])
}

function failedJoiningRoom(client){
  console.log("Failed Joining Room...")
  client.emit("JoinRoomFailed")
}

function failedCreateRoom(client){
  console.log("Failed Creating Room...")
  client.emit("CreateRoomFailed")
}

function sendQuestionsToPlayer(client){
  client.emit("RecieveQuestions", questions)
}

function sendGameStatusToAllPlayers(client, statusData){
  var roomID = statusData.roomID
  console.log(statusData)
  roomsData[roomID].hasStarted = statusData.hasStarted
  console.log(roomsData[roomID])
  client.in(""+roomID).emit("HasGameStarted", statusData)
}

function verifyRoomStatus(client, roomID){
  console.log("Verify Room Status....")
  var hasStarted = roomsData[roomID].hasStarted;
  console.log(roomsData[roomID])
  console.log(hasStarted)
  client.emit("HasGameStarted", {hasStarted: hasStarted})
  client.emit("ReceiveQuestionNumber", currentQuestionNum)
}

function sendRoomInfoToPlayer(roomID,client){
  var currentRoomData = roomsData[roomID]
  console.log("Sending Room Info...")
  console.log(currentRoomData)
  client.emit("ReceiveGameRoomInfo", {roomName: currentRoomData.roomName})
}

function sendMessagesToRoom(client) {
  let roomID = playersData["" + client.id].roomID
  let chatMessages = roomsData["" + roomID].chatMessages
  client.in(""+roomID).emit("GetChatMessages", chatMessages)
}











function sendStatusToPlayer(client){
  client.emit("SendStatusToPlayer", playersData)
  client.broadcast.emit("SendStatusToPlayer", playersData)
}




function sendCurrentClientID(client){
  client.emit("SendCurrentClientID", client.id)
}






//SERVER METHODS

function removePlayersRoomData(client){

  console.log("Removing Client Data....")
  let playerData = playersData["" + client.id]

  console.log(playerData)

  if(!playerData) {
    return
  }

  let roomID = playersData["" + client.id].roomID
  let playerID = playersData["" + client.id].playerID
  let username = playersData["" + client.id].username

  //Client leaves room
  if(roomID){
    client.leave(roomID)

    //Remove assigend room from player data
    playersData["" + client.id].roomID = null

    let roomData = roomsData[roomID]

    if(roomData){

      let roomPlayersData = roomData.players

      //Find and remove player from room data
      const index = roomPlayersData.indexOf(username);

      if (index > -1) {
        roomPlayersData.splice(index, 1);
      }

      updatePlayersInRoom(client, roomID)
    }

  }
}



function assignRoomToPlayer(clientID, roomID){
  playersData["" + clientID].roomID = "" + roomID

  console.log(playersData)
}

function checkIfRoomEmpty(roomID){

  if(!roomsData["" + roomID]) {
    return
  }

  //If empty, remove from room list
  if(roomsData["" + roomID].players.length <=0) {
    delete roomsData["" + roomID]
  }

}
