import React, {useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import MainWorld from './pages/MainWorld'

import socketIOClient from 'socket.io-client'

import {socket} from './services/socket'

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"; 

function App() {
  let playerID = localStorage.getItem('playerID')
  let username = localStorage.getItem('username')
  const [playerClientID, setPlayerClientID] = useState(null)

  useEffect(() => {
    console.log(`Saved Player ID: ${playerID}`)

    if(!playerID){

      socket.on("SetPlayerID", playerData => {
        
        localStorage.setItem('playerID', playerData.playerID)
        localStorage.setItem('username', playerData.username)
        console.log(`New Created Player ID: ${playerData.playerID}`)
        console.log(`New Created Username: ${playerData.username}`)

        socket.emit("PlayerConnected", playerData)
      });

      socket.emit("CreatePlayerID")
    } 
    else {
      socket.emit("PlayerConnected", {playerID: playerID, username: username})
    }


    socket.on("SendCurrentClientID", clientID => {
        setPlayerClientID(clientID) 
        console.log(clientID)
    });


    return () => {
      socket.emit("DisconnectPlayer", {playerID: playerID, username: username});
      socket.off("SetPlayerID")
      socket.off("SendCurrentClientID")
      socket.disconnect();
    }

  }, []);

  return (
    <Router >
      <div style={{backgroundColor:'#212459', height: '100vh'}} className="App">
      
        <Switch>

          <Route 
            render={(props) => (
              <MainWorld {...props} socket={socket} playerClientID = {playerClientID}/>
            )}
            exact path="/"
          />


        </Switch>
      </div>
    </Router>
  );
}

export default App;
