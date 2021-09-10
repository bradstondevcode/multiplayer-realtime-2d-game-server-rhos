import React, {Component } from 'react';
import Button from '@material-ui/core/Button';
import { Row, Container } from 'react-bootstrap';

import Player from '../components/Player'
import OtherPlayer from '../components/OtherPlayer'

let styles = {
	viewContainer: {
		height: '90vh%',
		width: '90vw%',
		backgroundColor: 'green',
		borderColor: 'black',
		borderWidth: 50
	},
	beanOverlay: {
	    alignSelf: 'center',
	    position: 'absolute',
	    display: 'flex',
	    center: 0,
	    backgroundColor: '#171B3D'
	},
	jellyBeanLogo: {
		alignSelf: 'flex-start',
	    position: 'absolute',
	    display: 'flex',
	    top:'5vw',
	    left:'30vw',
	    width: '25vw',
	    height: '25vh'
	},
	jellyBeanButton: {
	    width: '9vw',
	    height: '6vw',
	    backgroundSize: '100% 100%',
     	backgroundPosition: 'center',
     	margin: 10
	},
	jellyBeanButtonText: {
		position: 'absolute',
		display: 'flex',
		center: 0,
		fontSize: '1vw',
		fontWeight: 'bold'
	},
	centerButtonRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
	}
}

class MainWorld extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	totalWorlds: 0,
	    	socket: null,
	    	playerClientID: null,
	    	playerName: null,
	    	serverPlayerStatus: null,
	    	otherPlayerClientIDs: [],
	    	allPlayerStatuses: {}
	    };

	}

	async componentDidMount(){

		var propsLocationState = this.props.location.state
		//Mimics Page Refreshing capability (Essentially a routing hack)
		if(propsLocationState){
			
		}

		this.setState({socket: this.props.socket})

		this.props.socket.on("SendStatusToPlayer", allPlayerStatuses => {

			if(this.props.playerClientID) {
				console.log(allPlayerStatuses)
				this.setState({serverPlayerStatus: allPlayerStatuses[this.props.playerClientID]})
				delete allPlayerStatuses[this.props.playerClientID]
				console.log(allPlayerStatuses)
				var otherPlayerClientIDs = Object.keys(allPlayerStatuses)
				console.log(otherPlayerClientIDs)
				// var prunedIDs = this.removeItemOnce(playerClientIDs, this.props.playerClientID)
				// console.log(prunedIDs)

				this.setState({allPlayerStatuses: allPlayerStatuses, otherPlayerClientIDs: otherPlayerClientIDs})
			}

		})

	}

	componentWillUnmount(){
		this.props.socket.off("SendStatusToPlayer")
	}

	//Utility Method
	removeItemOnce(arr, value) {
	  var index = arr.indexOf(value);
	  if (index > -1) {
	    arr.splice(index, 1);
	  }
	  return arr;
	}


	render(){

		var {allPlayerStatuses} = this.state

		return (
			<Container style={styles.viewContainer}>

			<Player socket={this.state.socket} playerClientID={this.props.playerClientID} playerName= {this.state.playerName}></Player>



			{
				this.state.otherPlayerClientIDs.map( (otherPlayerID) => (
					<OtherPlayer key={otherPlayerID} clientID={otherPlayerID} status={allPlayerStatuses[otherPlayerID].status} playerName={allPlayerStatuses[otherPlayerID].username}></OtherPlayer>
				))

			}


	    	</Container>
		);
	}
}

export default MainWorld;