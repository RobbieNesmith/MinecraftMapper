import React from "react";
import ReactDOM from "react-dom";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";

import Item from "./Components/Item";
import ItemSelector from "./Components/ItemSelector";

class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let vertex = {}
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

class TradeSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {villagersList: [], vertex: {}};
  }
  
  componentDidMount() {
    let appDataEl = document.getElementById("appdata")
    let villagersString = appDataEl.dataset.villagers;
    let vertexString = appDataEl.dataset.vertex;
    let villagersList = [];
    let vertex = {};
    if (villagersString) {
      villagersList = JSON.parse(villagersString);
    }
    if (vertexString) {
        vertex = JSON.parse(vertexString);
    }
    
    this.setState({villagersList: villagersList, vertex: vertex, showAddVillager: false});
    this.addVillager = this.addVillager.bind(this);
    this.editVillager = this.editVillager.bind(this);
    this.deleteVillager = this.deleteVillager.bind(this);
  }

  addVillager() {
    let formData = new FormData();
    let vList = this.state.villagersList;

    formData.append("locationid", this.state.vertex.id);
    formData.append("name", document.getElementById("NewVillagerName").value);
    formData.append("type", document.getElementById("NewVillagerType").value);
    fetch("/api/villagers/add",
        {
          method: "POST",
          body: formData
        })
      .then(res => res.json())
      .then(json => {
        vList.push(json);
        this.setState({showAddVillager: false, villagersList: vList});
      })

  }

  editVillager(id, name, type) {
    let formData = new FormData();
    let vList = this.state.villagersList;
    formData.append("id", id);
    formData.append("locationid", this.state.vertex.id);
    formData.append("name", name);
    formData.append("type", type);
    fetch("/api/villagers/edit",
      {
        method: "POST",
        body: formData
      })
    .then(res => res.json())
    .then(json => {
      let index = vList.map(v => v.id).indexOf(id);
      json.trades = vList[index].trades;
      this.setState({"villagersList": [...vList.slice(0, index), json, ...vList.slice(index + 1)]})
    })
  }

  deleteVillager(id) {
    let vList = this.state.villagersList;
    let formData = new FormData();
    formData.append("id", id);
    fetch("/api/villagers/delete", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(json => this.setState({villagersList: vList.filter(v => v.id != id)}));
  }

  render() {
    return (
      <div>
        <Container>
    <Row>
      { this.state.villagersList.map(villager => {
          return (
      <Col xs={12} lg={6}>
        <Villager id={ villager.id } name={ villager.name } type={ villager.type } trades={ villager.trades } editHandler={ this.editVillager } deleteHandler={ this.deleteVillager } />
      </Col>
          );
        }
      )}
      <Col xs={12} lg={6}>
        <Button block onClick={ () => this.setState({showAddVillager: true}) }>Add new Villager</Button>
      </Col>
    </Row>
        </Container>
        <Modal
          show={ this.state.showAddVillager  }
          onHide={ () => this.setState({showAddVillager: false}) }
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Villager</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="NewVillagerName">
              <Form.Label>Villager Name</Form.Label>
              <FormControl />
            </Form.Group>
            <Form.Group controlId="NewVillagerType">
              <Form.Label>Villager Type</Form.Label>
              <FormControl />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={ this.addVillager }>Add</Button>
            <Button variant="secondary" onClick={ () => this.setState({showAddVillager: false}) }>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class Villager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showAddTrade: false, showEdit: false, name: this.props.name, type: this.props.type}
  }
  
  render() {
    return (
      <Card>
        <Card.Header>
          <div className="spaceItems">
            <h3>
              { this.props.name }
            </h3>
            <span>
              <Button variant="success" onClick={ ()=> this.setState({showEdit: true})}><i className="fa fa-edit" /></Button>
              <Button variant="danger" onClick={ ()=>this.props.deleteHandler(this.props.id) }><i className="fa fa-trash" /></Button>
            </span>
          </div>
        </Card.Header>
        <ListGroup variant="flush">
          { this.props.trades.map(trade => {
              return <Trade mode="display" offer={ {item1: trade.item1, item2: trade.item2, item3: trade.item3} } />;
            })
          }
          <ListGroup.Item>
            <Button block variant="secondary" onClick={() => this.setState({showAddTrade: true})}>Add new trade</Button>
          </ListGroup.Item>
        </ListGroup>
        <Modal
          show={ this.state.showEdit }
          onHide={ () => this.setState({showEdit: false}) }
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit { this.props.name }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId={ `VillagerName_${this.props.id}` }>
              <Form.Label>Villager Name</Form.Label>
              <FormControl value={ this.state.name } onChange={ (event) => this.setState({"name": event.target.value}) } />
            </Form.Group>
            <Form.Group controlId={ `VillagerType_${this.props.id}` }>
              <Form.Label>Villager Type</Form.Label>
              <FormControl value={ this.state.type } onChange={ (event) => this.setState({"type": event.target.value}) } />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={ ()=> this.setState({showEdit: false}, ()=>this.props.editHandler(this.props.id, this.state.name, this.state.type)) }>
              Save
            </Button>
            <Button variant="secondary" onClick={ () => this.setState({showEdit: false}) }>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={ this.state.showAddTrade  }
          onHide={ () => this.setState({showAddTrade: false}) }
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Trade for { this.props.name }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="NewTradeItem1">
              <Form.Label>Trade item 1</Form.Label>
              <FormControl />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={ ()=>console.log("foo") }>Add</Button>
            <Button variant="secondary" onClick={ () => this.setState({showAddTrade: false}) }>Cancel</Button>
          </Modal.Footer>
        </Modal>
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
