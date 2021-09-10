import socketIOClient from "socket.io-client";
const serverEndpoint = "http://multiplayer-game-server-rhos-a-2d-multiplayer.mult-server-bsh-b3c-4x16-162e406f043e20da9b0ef0731954a894-0000.us-east.containers.appdomain.cloud/";

export const socket = socketIOClient(serverEndpoint, {
	transports: ['websocket']
});
