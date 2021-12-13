import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import {Button, List, ListItem, Paper, TextField, Typography} from "@mui/material";

class App extends React.Component {
    state = {
        list: [
            "Kaczmarzyk",
            "Sikorski",
            "Dybowski",
            "Krzyżanowski",
            "Grącka",
            "Dziwusz"
        ],
        // list: ["$100", "$500", "$9,999", "$1", "$60", "$1,000", "$4.44"],
        // list: ["$100","$500","$9,999","$1","$60"],
        radius: 75, // PIXELS
        rotate: 0, // DEGREES
        easeOut: 0, // SECONDS
        angle: 0, // RADIANS
        top: null, // INDEX
        offset: null, // RADIANS
        net: null, // RADIANS
        result: null, // INDEX
        spinning: false,
        holdTime: 0,
        newElement: ''
    };

    componentDidMount() {
        // generate canvas wheel on load
        // this.renderWheel();

        let test = setInterval(() => {
            this.setState({holdTime: this.state.holdTime + 1})
            console.log(this.state.holdTime)
        }, 750)
    }

    renderWheel() {
        // determine number/size of sectors that need to created
        let numOptions = this.state.list.length;
        let arcSize = (2 * Math.PI) / numOptions;
        this.setState({
            angle: arcSize
        });

        // get index of starting position of selector
        this.topPosition(numOptions, arcSize);

        // dynamically generate sectors from state list
        let angle = 0;
        for (let i = 0; i < numOptions; i++) {
            let text = this.state.list[i];
            this.renderSector(i + 1, text, angle, arcSize, this.getColor());
            angle += arcSize;
        }
    }

    topPosition = (num, angle) => {
        // set starting index and angle offset based on list length
        // works upto 9 options
        let topSpot = null;
        let degreesOff = null;
        if (num === 9) {
            topSpot = 7;
            degreesOff = Math.PI / 2 - angle * 2;
        } else if (num === 8) {
            topSpot = 6;
            degreesOff = 0;
        } else if (num <= 7 && num > 4) {
            topSpot = num - 1;
            degreesOff = Math.PI / 2 - angle;
        } else if (num === 4) {
            topSpot = num - 1;
            degreesOff = 0;
        } else if (num <= 3) {
            topSpot = num;
            degreesOff = Math.PI / 2;
        }

        this.setState({
            top: topSpot - 1,
            offset: degreesOff
        });
    };

    renderSector(index, text, start, arc, color) {
        // create canvas arc for each list element
        let canvas = document.getElementById("wheel");
        let ctx = canvas.getContext("2d");
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let radius = this.state.radius;
        let startAngle = start;
        let endAngle = start + arc;
        let angle = index * arc;
        let baseSize = radius * 3.33;
        let textRadius = baseSize - 150;

        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, false);
        ctx.lineWidth = radius * 2;
        ctx.strokeStyle = color;

        ctx.font = "17px Arial";
        ctx.fillStyle = "black";
        ctx.stroke();

        ctx.save();
        ctx.translate(
            baseSize + Math.cos(angle - arc / 2) * textRadius,
            baseSize + Math.sin(angle - arc / 2) * textRadius
        );
        ctx.rotate(angle - arc / 2 + Math.PI / 2);
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }

    getColor() {
        // randomly generate rbg values for wheel sectors
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return `rgba(${r},${g},${b},0.4)`;
    }

    spin = (event) => {
        // set random spin degree and ease out time
        // set state variables to initiate animation
        let randomSpin


        console.log(this.state.holdTime)
        // random
        if (this.state.holdTime < 2) {
            randomSpin = Math.floor(Math.random() * 900) + 500;
        }
        // gradzka
        else {
            let size = this.state.list.length
            let index = this.state.list.findIndex(x => x.toUpperCase() === 'GRACKA')
            if (index === -1) {
                index = this.state.list.findIndex(x => x.toUpperCase() === 'GRĄCKA')
            }

            console.log('INdex', index)

            if (index >= 0) {
                let element = 360 / size
                let kat = element * (index) + element / 2+90
                let polowka = element / 2

                console.log('Element', element)
                console.log('Kat', kat)

                randomSpin = Math.floor(Math.floor(Math.random() * (kat + polowka - (kat - polowka))) + (kat - polowka)) + 360 * 3
                console.log('random',randomSpin)
            } else {
                randomSpin = Math.floor(Math.random() * 900) + 500;
            }
        }
        this.setState({
            rotate: randomSpin,
            easeOut: 2,
            spinning: true
        });

        // calcalute result after wheel stops spinning
        setTimeout(() => {
            this.getResult(randomSpin);
        }, 2000);
    };

    getResult = spin => {
        // find net rotation and add to offset angle
        // repeat substraction of inner angle amount from total distance traversed
        // use count as an index to find value of result from state list
        const {angle, top, offset, list} = this.state;
        let netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
        let travel = netRotation + offset;
        let count = top + 1;
        while (travel > 0) {
            travel = travel - angle;
            count--;
        }
        let result;
        if (count >= 0) {
            result = count;
        } else {
            result = list.length + count;
        }

        // set state variable to display result
        this.setState({
            net: netRotation,
            result: result
        });
    };

    reset = () => {
        // reset wheel and result
        this.setState({
            rotate: 0,
            easeOut: 0,
            result: null,
            spinning: false,
            holdTime: 0
        });
    };

    render() {
        return (
            <div className="App">
                <h1>Spinning Prize Wheel React</h1>
                <span id="selector">&#9660;</span>
                <canvas
                    id="wheel"
                    width="500"
                    height="500"
                    style={{
                        WebkitTransform: `rotate(${this.state.rotate}deg)`,
                        WebkitTransition: `-webkit-transform ${
                            this.state.easeOut
                        }s ease-out`
                    }}
                />

                {this.state.spinning ? (
                    <button type="button" id="reset" onClick={this.reset}>
                        reset
                    </button>
                ) : (
                    <button type="button" id="spin" onClick={this.spin} onMouseEnter={this.startTime}>
                        spin
                    </button>
                )}
                <div class="display">
          <span id="readout">
            YOU WON:{"  "}
              <span id="result">{this.state.list[this.state.result]}</span>
          </span>
                </div>


                <Paper elevation={0} className={'inputy'} sx={{display: 'flex', flexDirection: 'column'}}>
                    <TextField label={'New Element'} variant={'outlined'} onChange={this.addInput}/>
                    <Button variant={'contained'} onClick={this.addElement}>Add</Button>
                    <List>
                        {this.state.list.map((item, index) => (
                            <ListItem id={index}>
                                <Typography>{item}</Typography>
                            </ListItem>
                        ))}
                    </List>
                    {/*<Button variant={'contained'} onClick={this.resetList}>Reset</Button>*/}
                    <Button variant={'contained'} onClick={this.renderNewWheel}>Render</Button>
                </Paper>

            </div>
        );
    }

    startTime = () => {
        this.setState({holdTime: 0})
        console.log('State clear')
    }


    addInput = (e) => {
        this.setState({newElement: e.target.value})
        console.log(e.target.value)
        // this.setState({newElement: e.target.value})
    }

    addElement = () => {
        if (this.state.newElement !== '')
            this.setState({
                list: [...this.state.list, this.state.newElement],
                newElement: '',
            })

        // this.renderWheel()
    }

    resetList = () => {
        this.setState({list: []})
    }

    renderNewWheel = () => {
        this.renderWheel()
    }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
