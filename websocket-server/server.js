var uuid = require('uuid-random');
const WebSocket = require('ws')

const wss = new WebSocket.WebSocketServer({port:8080}, ()=> {
	console.log('server started')
})

var roomsData = {

}

var playersData = {
	"type" : "playerData"

}


// function noop() {}

// function heartbeat() {
//   this.isAlive = true;
// }

// const interval = setInterval(function ping() {

//   wss.clients.forEach(function each(ws) {
//     if (ws.isAlive === false) return ws.terminate();

//     ws.isAlive = false;
//     ws.ping(noop);
//   });

// }, 30000);



wss.on('connection', function connection(client){

	client.id = uuid();

	console.log(`Client ${client.id} Connected!`)

	playersData[""+client.id] = {id: client.id, position: {xPos: 0, yPos: 0, zPos: 0, xRot: 0, yRot: 0, zRot: 0, stale: false}}
	var currentClient = playersData[""+client.id]

	client.isAlive = true;

	client.send(`{"id": "${client.id}", "xPos": ${currentClient.position.xPos}, "yPos": ${currentClient.position.yPos}, "zPos": ${currentClient.position.zPos}, "xRot": ${currentClient.position.xRot}, "yRot": ${currentClient.position.yRot}, "zRot": ${currentClient.position.zRot} }`)

	// client.on('pong', heartbeat);



	client.on('message', (data) => {
		var dataJSON = JSON.parse(data)

		playersData[dataJSON.id].position = {xPos: dataJSON.xPos, yPos: dataJSON.yPos, zPos: dataJSON.zPos, xRot: dataJSON.xRot, yRot: dataJSON.yRot, zRot: dataJSON.zRot, stale: false}
		console.log(playersData[dataJSON.id].position)

		var tempPlayersData = Object.assign({}, {}, playersData)

		var keys = Object.keys(tempPlayersData)

		//Remove "type" from keys array
		keys = removeItemOnce(keys, "type")

		tempPlayersData["playerIDs"] = keys
		
		client.send(JSON.stringify(tempPlayersData))
	})



	client.on('close', () => {
		console.log('This Connection Closed!')

		console.log("Removing Client: " + client.id)

		wss.clients.forEach(function each(cl) {
	      if (cl.readyState === WebSocket.OPEN) {
	      	console.log(`Client with id ${client.id} just left`)
	        cl.send(`Closed:${client.id}`);
	      }
	    });

		delete playersData[""+client.id]

		console.log(playersData)

	})

})

wss.on('close', function close(){
	console.log('connection closed')
	// clearInterval(interval)
})

wss.on('listening', () => {
	console.log('listening on 8080')
})

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}