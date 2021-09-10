import React, {Component } from 'react';
import Button from '@material-ui/core/Button';
import { Row, Container } from 'react-bootstrap';

let styles = {
	viewContainer: {
		height: 30,
		width: 30,
		borderRadius: 30 / 2,
		backgroundColor: 'red',
		position: 'absolute',
		left: 100
	},
	another: {
		borderWidth: 2,
		borderColor: 'black',
		backgroundColor: 'black',
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
	},
	someStyle: {height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: 'red', position: 'absolute', top: 100, left: 100}
}

class Player extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	top: 100,
	    	left: 100
	    };
	    this.buttonPressed = this.buttonPressed.bind(this)
	}

	async componentDidMount(){
		document.addEventListener("keydown", this.buttonPressed, false);

		console.log(this.props.socket)

		this.setState({ username: localStorage.getItem('username')})
		
	}

	componentWillUnmount(){

		document.removeEventListener("keydown", this.buttonPressed, false);
	}

	buttonPressed(event){
		// console.log(event)

		// switch(event){
		// 	case event.keyCode == 39:
		// 		console.log("Right Arrow Pressed!")
		// 	default:
		// 		return
		// }

		var movementAmount = 10

		if(event.keyCode == 37 || event.key == "ArrowLeft"){
			// console.log("Left Arrow Pressed!")
			this.setState({left: this.state.left-movementAmount})
		}

		if(event.keyCode == 38 || event.key == "ArrowUp"){
			// console.log("Up Arrow Pressed!")
			this.setState({top: this.state.top-movementAmount})
		}

		if(event.keyCode == 39 || event.key == "ArrowRight"){
			// console.log("Right Arrow Pressed!")
			this.setState({left: this.state.left+movementAmount})
		}

		if(event.keyCode == 40 || event.key == "ArrowDown"){
			// console.log("Down Arrow Pressed!")
			this.setState({top: this.state.top+movementAmount})
		}

		this.props.socket.emit("PlayerStatusUpdated", {top:this.state.top, left: this.state.left})
	}

	render(){

		return (
			<Container style={{...styles.viewContainer, ...{top: this.state.top, left: this.state.left}}}>
			{this.state.username}

	    	</Container>
		);
	}
}

export default Player;