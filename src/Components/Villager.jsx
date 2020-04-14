import React from "react";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";

import Trade from "./Trade";
import ItemSelector from "./ItemSelector";

const validTypes = ["Armorer", "Butcher", "Cartographer", "Cleric", "Farmer", "Fisherman", "Fletcher", "Leatherworker", "Librarian", "Mason", "Shepherd", "Toolsmith", "Weaponsmith"];

class Villager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showAddTrade: false,
      showEdit: false,
      name: this.props.name,
      type: this.props.type,
      newTrade: {
        item1: "",
        item1amt: 0,
        item2: "",
        item2amt: 0,
        item3: "",
        item3amt: 0,
        enchantment: ""
      }
    }
    this.addTradeHandler = this.addTradeHandler.bind(this);
    this.cancelAddHandler = this.cancelAddHandler.bind(this);
  }
  
  addTradeHandler() {
    let formData = new FormData();
    formData.append("villagerid", this.props.id);
    formData.append("item1", this.state.newTrade.item1);
    formData.append("item1amt", this.state.newTrade.item1amt);
    formData.append("item2", this.state.newTrade.item2);
    formData.append("item2amt", this.state.newTrade.item2amt);
    formData.append("item3", this.state.newTrade.item3);
    formData.append("item3amt", this.state.newTrade.item3amt);
    if (this.state.newTrade.enchantment) {
      formData.append("enchantment", this.state.newTrade.enchantment);
    }
    
    fetch("/api/trades/add", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(json => {
      this.setState({ newTrade: {item1: "", item1amt: 0, item2: "", item2amt: 0, item3: "", item3amt: 0, enchantment: ""} }, () => this.props.setTradesHandler(this.props.id, json))
    });
  }

  cancelAddHandler() {
    this.setState({showAddTrade: false,
      newTrade: {
        item1: "",
        item1amt: 0,
        item2: "",
        item2amt: 0,
        item3: "",
        item3amt: 0,
        enchantment: ""
      }});
  }
  
  render() {
    let profImg = null;
    if (validTypes.includes(this.props.type)) {
      profImg = <img className="professionimage" src={ `/static/img/professions/${this.props.type}.png` } />;
    }
    return (
      <Card>
        <Card.Header>
          <div className="spaceItems">
            <h3>
	      { profImg }
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
              return <Trade
                editHandler={ this.props.editTradeHandler }
                deleteHandler={ this.props.deleteTradeHandler }
                offer={ trade }
              />;
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
              <Form.Control value={ this.state.name } onChange={ (event) => this.setState({"name": event.target.value}) } />
            </Form.Group>
            <Form.Group controlId={ `VillagerType_${this.props.id}` }>
              <Form.Label>Villager Type</Form.Label>
              <Form.Control value={ this.state.type } onChange={ (event) => this.setState({"type": event.target.value}) } />
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
          onHide={ this.cancelAddHandler }
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Trade for { this.props.name }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs="6">
                  <Form.Group controlId="NewTradeItem1">
                    <Form.Label>Trade item 1</Form.Label>
                    <ItemSelector changeHandler={ (itemName) => this.setState({newTrade: {...this.state.newTrade, item1: itemName}}) } />
                  </Form.Group>
                </Col>
                <Col xs="6">
                  <Form.Group controlId="NewTradeItem1Amt">
                    <Form.Label>Trade item 1 Amount</Form.Label>
                    <Form.Control type="number" onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, item1amt: event.target.value}}) } />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col xs="6">
                  <Form.Group controlId="NewTradeItem2">
                    <Form.Label>Trade item 2</Form.Label>
                    <ItemSelector changeHandler={ (itemName) => this.setState({newTrade: {...this.state.newTrade, item2: itemName}}) } />
                  </Form.Group>
                </Col>
                <Col xs="6">
                  <Form.Group controlId="NewTradeItem2Amt">
                    <Form.Label>Trade item 2 Amount</Form.Label>
                    <Form.Control type="number"  onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, item2amt: event.target.value}}) } />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col xs="6">
                  <Form.Group controlId="NewTradeItem3">
                    <Form.Label>Trade item 3</Form.Label>
                    <ItemSelector changeHandler={ (itemName) => this.setState({newTrade: {...this.state.newTrade, item3: itemName}}) } />
                  </Form.Group>
                </Col>
                <Col xs="6">
                  <Form.Group controlId="NewTradeItem3Amt">
                    <Form.Label>Trade item 3 Amount</Form.Label>
                    <Form.Control type="number"  onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, item3amt: event.target.value}}) } />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs="12">
                  <Form.Group controlId="NewTradeEnchantment">
                    <Form.Label>Trade Enchantment</Form.Label>
                    <Form.Control onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, enchantment: event.target.value}}) } />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={ ()=>this.setState({showAddTrade: false}, this.addTradeHandler) }>Add</Button>
            <Button variant="secondary" onClick={ this.cancelAddHandler }>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </Card>
    );
  }
}

export default Villager;
