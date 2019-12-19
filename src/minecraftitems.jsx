import React from "react";
import ReactDOM from "react-dom";

import Button from "react-bootstrap/Button";

import TradeSet from "./Components/TradeSet";

class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let vertex = {};
    let vertexString = document.getElementById("appdata").dataset.vertex;

    if (vertexString) {
      vertex = JSON.parse(vertexString);
    }
    return (
      <header>
        <h1>Trades for { vertex.name }</h1>
        <Button href="/" variant="primary">Back to map</Button>
      </header>
    );
  }
}

ReactDOM.render(<main><Header /><TradeSet /></main>, document.getElementById("app"));
