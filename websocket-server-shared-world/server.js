var uuid = require('uuid-random');
const WebSocket = require('ws')

const wss = new WebSocket.WebSocketServer({port:8080}, ()=> {
	console.log('server started')
})


//For future implementation of Rooms
var roomsData = {

}

var sharedWorldObjects = {
	"type": "sharedWorldObjects",

}

//Object that store data 
var playersData = {
	"type" : "playerData"

}

//=====WEBSOCKET FUNCTIONS======

//Websocket function that managages connection with clients
wss.on('connection', function connection(client){

	//Create Unique User ID for player
	client.id = uuid();

	console.log(`Client ${client.id} Connected!`)

	//Add default data to new connected client (player) data
	playersData[""+client.id] = {id: client.id, position: {xPos: 0, yPos: 0, zPos: 0, xRot: 0, yRot: 0, zRot: 0, timestamp: 0.0, sprinting: false, swingAxe: false, movementSpeed: 0, stale: false}}
	
	var currentClient = playersData[""+client.id]

	//NOT CURRENTLY USED
	client.isAlive = true;

	//Send default client data back to client for reference
	client.send(`{"id": "${client.id}", "xPos": ${currentClient.position.xPos}, "yPos": ${currentClient.position.yPos}, "zPos": ${currentClient.position.zPos}, "xRot": ${currentClient.position.xRot}, "yRot": ${currentClient.position.yRot}, "zRot": ${currentClient.position.zRot}, "timestamp": ${currentClient.position.timestamp}, "sprinting": ${false}, "swingAxe": ${false}, "movementSpeed": ${currentClient.position.movementSpeed},  "stale": ${false} }`)


	client.on('message', (data) => {
		var dataJSON = JSON.parse(data)

		if(dataJSON["serverCommand"]){
			console.log("Server Command Recieved")
			console.log("=============")
			console.log(dataJSON)
			console.log("=============")

			//Iterate over all clients and send them specified server
			wss.broadcast(JSON.stringify(dataJSON))
			
			return;
		}

		if (dataJSON.objType) {
			console.log("isSharedObj")
			console.log(dataJSON)
			wss.broadcast(JSON.stringify(dataJSON))
			// client.send(JSON.stringify(dataJSON))

			return
		} 

		if(dataJSON["spectator"]){
			var spectatorID = dataJSON["id"]

			if(playersData[spectatorID]){
				delete playersData[spectatorID]
			}

		}
		else {
			playersData[dataJSON.id].position = {xPos: dataJSON.xPos, yPos: dataJSON.yPos, zPos: dataJSON.zPos, xRot: dataJSON.xRot, yRot: dataJSON.yRot, zRot: dataJSON.zRot, timestamp: dataJSON.timestamp, sprinting: dataJSON.sprinting, swingAxe: dataJSON.swingAxe, movementSpeed: dataJSON.movementSpeed,  stale: false}
			// console.log(playersData[dataJSON.id].position)
		
		}

		var tempPlayersData = Object.assign({}, {}, playersData)

		var keys = Object.keys(tempPlayersData)

		//Remove "type" from keys array
		keys = removeItemOnce(keys, "type")

		tempPlayersData["playerIDs"] = keys
		
		client.send(JSON.stringify(tempPlayersData))


	})

	//Message sent when Client disconnevts from server
	client.on('close', () => {
		console.log('This Connection Closed!')

		console.log("Removing Client: " + client.id)

		//Iterate over all clients and inform them that a client with specified ID has disconnected
		wss.clients.forEach(function each(cl) {
	      if (cl.readyState === WebSocket.OPEN) {
	      	console.log(`Client with id ${client.id} just left`)
	      	//Send to client which other client (via/ id) has disconnected
	        cl.send(`Closed:${client.id}`);
	      }
	    });

		//Remove disconnected player from player data object
		delete playersData[""+client.id]

		console.log(playersData)

	})

})

wss.on('listening', () => {
	console.log('listening on 8080')
})

wss.broadcast = function broadcast(message) {
	wss.clients.forEach(function each(cl) {
		cl.send(message)
	})
}


//=====UTILITY FUNCTIONS======

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}