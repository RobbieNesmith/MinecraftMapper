import React from "react";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import FormControl from "react-bootstrap/FormControl";
import ListGroup from "react-bootstrap/ListGroup";

import ItemDisplayer from "./ItemDisplayer";
import ItemSelector from "./ItemSelector";

class Trade extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let offer = this.props.offer;
    return (
      <ListGroup.Item>
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
            </Col>
          </Row>
        </Container>
      </ListGroup.Item>
    );
  }
}

export default Trade;