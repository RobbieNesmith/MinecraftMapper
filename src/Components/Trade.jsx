import React from "react";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";

import ItemDisplayer from "./ItemDisplayer";
import ItemSelector from "./ItemSelector";

class Trade extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEdit: false,
      newTrade: this.props.offer
    };
  }
  
  render() {
    let offer = this.props.offer;
    return (
      <span>
        <ListGroup.Item>
          <div style={{ display: "flex"}}>
            <Container>
              <Row>
                <Col xs={3}>
                  <ItemDisplayer name={ offer.item1 } />
                  <span>{ offer.item1amt > 0 ? offer.item1amt : "" }</span>
                </Col>
                <Col xs={3}>
                  <ItemDisplayer name={ offer.item2 } />
                  <span>{ offer.item2amt > 0 ? offer.item2amt : "" }</span>
                </Col>
                <Col xs={6}>
                  <ItemDisplayer name={ offer.item3 } />
                  <span>{ offer.item3amt > 0 ? offer.item3amt : "" }</span>
                  <span>{ offer.enchantment }</span>
                </Col>
              </Row>
            </Container>
              <span style={{flexGrow: 0, width: "100px"}}>
                <Button variant="outline-success" onClick={ () => this.setState({showEdit: true})}><i className="fa fa-edit" /></Button>
                <Button variant="outline-danger" onClick={ () => this.props.deleteHandler(this.props.offer.id) }><i className="fa fa-trash" /></Button>
              </span>
          </div>
        </ListGroup.Item>
        
        <Modal
            show={ this.state.showEdit  }
            onHide={ () => this.setState({showEdit: false}) }
          >
          <Modal.Header closeButton>
            <Modal.Title>Editing Trade</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs="6">
                  <Form.Group controlId="EditTradeItem1">
                    <Form.Label>Trade item 1</Form.Label>
                    <ItemSelector
                      value={ this.state.newTrade.item1 }
                      changeHandler={ (itemName) => this.setState({newTrade: {...this.state.newTrade, item1: itemName}}) }
                    />
                  </Form.Group>
                </Col>
                <Col xs="6">
                  <Form.Group controlId="EditTradeItem1Amt">
                    <Form.Label>Trade item 1 Amount</Form.Label>
                    <Form.Control
                      value={ this.state.newTrade.item1amt }
                      type="number"
                      onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, item1amt: event.target.value}}) }
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col xs="6">
                  <Form.Group controlId="EditTradeItem2">
                    <Form.Label>Trade item 2</Form.Label>
                    <ItemSelector
                      value={ this.state.newTrade.item2 }
                      changeHandler={ (itemName) => this.setState({newTrade: {...this.state.newTrade, item2: itemName}}) }
                    />
                  </Form.Group>
                </Col>
                <Col xs="6">
                  <Form.Group controlId="EditTradeItem2Amt">
                    <Form.Label>Trade item 2 Amount</Form.Label>
                    <Form.Control
                      value={ this.state.newTrade.item2amt }
                      type="number"
                      onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, item2amt: event.target.value}}) }
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col xs="6">
                  <Form.Group controlId="EditTradeItem3">
                    <Form.Label>Trade item 3</Form.Label>
                    <ItemSelector
                      value={ this.state.newTrade.item3 }
                      changeHandler={ (itemName) => this.setState({newTrade: {...this.state.newTrade, item3: itemName}}) }
                    />
                  </Form.Group>
                </Col>
                <Col xs="6">
                  <Form.Group controlId="EditTradeItem3Amt">
                    <Form.Label>Trade item 3 Amount</Form.Label>
                    <Form.Control
                      value={ this.state.newTrade.item3amt }
                      type="number"
                      onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, item3amt: event.target.value}}) }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs="12">
                  <Form.Group controlId="EditTradeEnchantment">
                    <Form.Label>Enchantment</Form.Label>
                    <Form.Control
                      value={ this.state.newTrade.enchantment }
                      onChange={ (event) => this.setState({newTrade: {...this.state.newTrade, enchantment: event.target.value}}) }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={ ()=>this.setState({showEdit: false}, ()=>this.props.editHandler(this.props.offer.villagerId, this.props.offer.id, this.state.newTrade)) }>Save</Button>
            <Button variant="secondary" onClick={ () => this.setState({showEdit: false}) }>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

export default Trade;
