import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Particles from 'react-particles-js';
import SignIn from './components/SignIn/SignIn.js'
import Register from './components/Register/Register.js'
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 700
      }
    }
  }
}

const initialState = {
      input: '',
      imageUrl: '',
      box: '',
      route: 'signin',
      isSignedIn: false,
      user: {
      	id: '',
		name: '',
		email: '',
		entries: 0,
		joined: ''
	}
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    }

  loadUser = (data) => {
  	this.setState({user: {
  		id: data.id,
		name: data.name,
		email: data.email,
		entries: data.entries,
		joined: data.date
  	}
  	})
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input})
    fetch('https://shielded-lake-00959.herokuapp.com/imageurl', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				input: this.state.input
			})
		})
    	.then(response => response.json())
		.then(response => {
		if (response) {
			fetch('https://shielded-lake-00959.herokuapp.com/image', {
			method: 'put',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				id: this.state.user.id
			})
		})
			.then(response => response.json())
			.then(count => {
				this.setState(Object.assign(this.state.user, { entries: count}))
			})
			.catch(console.log)
		}
		this.displayFaceBox(this.calculateFaceLocation(response))
	})
}

	calculateFaceLocation = (data) => {
		const boxarray = data.outputs[0].data.regions.map((item, index) => {
			console.log(item);
			const clarifaiFace = item.region_info.bounding_box;
			const image = document.getElementById('inputimage');
			console.log(image.width);
			const height = Number(image.width);
			const width = Number(image.height);
			return {
				leftCol: clarifaiFace.left_col * height,
			    topRow: clarifaiFace.top_row * width,
			    rightCol: height - (clarifaiFace.right_col * height),
			    bottomRow: width - (clarifaiFace.bottom_row * width)
				}
		})
		return boxarray;
	}

	displayFaceBox = (box) => {
		console.log("Box: ", box);
		this.setState({box: box});
	}

	onRouteChange = (route) => {
		if (route === 'signout') {
			this.setState({initialState})
		} else if (route === 'home') {
			this.setState({isSignedIn: true})
		}
		this.setState({route: route })
	}

  render() {
  	const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
            params={particlesOptions}
          />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'
        ? <div>
		        <Logo />
		        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
		        <ImageLinkForm 
		        onInputChange={this.onInputChange}
		        onButtonSubmit={this.onButtonSubmit}
		         />
		        <FaceRecognition box={box} imageUrl={imageUrl} />
		      </div>
        : (
        route === 'signin'
        ?
		    <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
		    :
		    <Register onRouteChange={this.onRouteChange} 
		    loadUser={this.loadUser}
		    />
		    )
		    }
      </div>
    )}
};

export default App;
