import React, {Component } from 'react';
import Button from '@material-ui/core/Button';
import { Row, Container } from 'react-bootstrap';

let styles = {
	viewContainer: {
		height: 30,
		width: 30,
		borderRadius: 30 / 2,
		backgroundColor: 'green',
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

class OtherPlayer extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	top: 100,
	    	left: 100
	    };
	}

	async componentDidMount(){

		console.log(this.props)
	}

	componentWillUnmount(){
	}

	render(){

		var {status, playerName} = this.props

		var top = 0
		var left = 0

		if(status){
			top = status.top
			left = status.left
		}

		return (
			<Container style={{...styles.viewContainer, ...{top: top, left: left}}}>
				{playerName}

	    	</Container>
		);
	}
}

export default OtherPlayer;