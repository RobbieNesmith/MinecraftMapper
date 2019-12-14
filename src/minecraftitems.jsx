import React from "react";
import ReactDOM from "react-dom";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import ListGroup from "react-bootstrap/ListGroup";

import Item from "./Components/Item";
import ItemSelector from "./Components/ItemSelector";

class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <header>
        <h1>Trades for { document.getElementById("appdata").dataset.vertexName }</h1>
        <Button href="/" variant="primary">Back to map</Button>
      </header>
    );
  }
}

class TradeSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {villagersList: []};
  }
  
  componentDidMount() {
    let villagersString = document.getElementById("appdata").dataset.villagers;
    let villagersList = [];
    if (villagersString) {
      villagersList = JSON.parse(villagersString);
    }
    
    this.setState({villagersList: villagersList});
  }
  
  render() {
    return (
      <Container>
        <Row>
          { this.state.villagersList.map(villager => {
              return (
                <Col xs={12} lg={6}>
                  <Villager name={ villager.name } trades={ villager.trades } />
                </Col>
              );
            }
          )}
          <Col xs={12} lg={6}>
            <AddVillager />
          </Col>
        </Row>
      </Container>
    );
  }
}

class AddVillager extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return <Button block>Add new Villager</Button>
  }
}

class Villager extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <Card>
        <Card.Header>{ this.props.name }</Card.Header>
        <ListGroup variant="flush">
          { this.props.trades.map(trade => {
              return <Trade mode="display" offer={ {item1: trade.item1, item2: trade.item2, item3: trade.item3} } />;
            })
          }
        </ListGroup>
      </Card>
    );
  }
}

class ItemDisplayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: {}, ready: false}
  }
  
  componentDidMount() {
    let itemDict = {}
    let itemsStr = document.getElementById("appdata").dataset.itemDict;
    if (itemsStr) {
      itemDict = JSON.parse(itemsStr);
    }
    this.setState({items: itemDict, ready: true});
  }
  
  render() {
    if (this.props.name && this.state.ready) {
      console.log("ItemDisplayer name");
      console.log(this.props.name);
      console.log("ItemDisplayer items");
      console.log(this.state.items);
      let item = this.state.items[this.props.name];
      return(
        <div className="itemDisplayer" title={ this.props.name }>
          <Item
            name={ this.props.name }
            img={ item.img }
            position={ item.position }
            showText={ false }
          />
        </div>
      );
    } else {
      return null;
    }
  }
}

class Trade extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let offer = this.props.offer;
    console.log("Trade offer");
    console.log(offer);
    if (this.props.mode=="addEdit") {
      return (
        <ListGroup.Item>
          <Container>
            <Row>
              <Col xs={3}>
                <ItemSelector />
                <FormControl />
              </Col>
              <Col xs={3}>
                <ItemSelector />
                <FormControl />
              </Col>
              <Col xs={6}>
                <ItemSelector />
                <FormControl />
              </Col>
            </Row>
          </Container>
        </ListGroup.Item>
      );
    } else {
      return (
        <ListGroup.Item>
          <Container>
            <Row>
              <Col xs={3}>
                <ItemDisplayer name={ offer.item1 } />
              </Col>
              <Col xs={3}>
                <ItemDisplayer name={ offer.item2 } />
              </Col>
              <Col xs={6}>
                <ItemDisplayer name={ offer.item3 } />
              </Col>
            </Row>
          </Container>
        </ListGroup.Item>
      );
    }
  }
}

ReactDOM.render(<main><Header /><TradeSet /></main>, document.getElementById("app"));
