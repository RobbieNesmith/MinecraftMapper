import React from "react";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

import Villager from "./Villager";

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
    this.setVillagerTrades = this.setVillagerTrades.bind(this);
    this.deleteVillager = this.deleteVillager.bind(this);
    this.editTrade = this.editTrade.bind(this);
    this.deleteTrade = this.deleteTrade.bind(this);
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

  setVillagerTrades(id, trades) {
    let vList = this.state.villagersList;
    let villager = this.state.villagersList.filter((v) => v.id == id)[0];
    villager.trades = trades;
    let index = vList.map(v => v.id).indexOf(id);
    this.setState({"villagersList": [...vList.slice(0, index), villager, ...vList.slice(index + 1)]})
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
  
  editTrade(villagerId, id, trade) {
    let formData = new FormData();
    formData.append("id", id);
    formData.append("villagerid", villagerId);
    formData.append("item1", trade.item1);
    formData.append("item1amt", trade.item1amt);
    formData.append("item2", trade.item2);
    formData.append("item2amt", trade.item2amt);
    formData.append("item3", trade.item3);
    formData.append("item3amt", trade.item3amt);
    fetch("/api/trades/edit", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(json => {
      let vList = this.state.villagersList;
      let villagerIndex = vList.map(v => v.id).indexOf(villagerId);
      let villager = vList[villagerIndex];
      let tList = villager.trades;
      let tradeIndex = tList.map(t => t.id).indexOf(id);
      villager.trades = [...tList.slice(0, tradeIndex), trade, ...tList.slice(tradeIndex + 1)];
      this.setState({"villagersList": [...vList.slice(0, villagerIndex), villager, ...vList.slice(villagerIndex + 1)]})
    });
  }
  
  deleteTrade(id) {
    let formData = new FormData();
    formData.append("id", id);
    fetch("/api/trades/delete", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(json => {
      let vList = this.state.villagersList;
      this.setState({villagersList: vList.map(v => {return {...v, trades: v.trades.filter(t => t.id != id)}})});
    });
  }

  render() {
    return (
      <div>
        <Container>
    <Row>
      { this.state.villagersList.map(villager => {
          return (
            <Col xs={12} lg={6}>
              <Villager
                id={ villager.id }
                name={ villager.name }
                type={ villager.type }
                trades={ villager.trades }
                editHandler={ this.editVillager }
                setTradesHandler={ this.setVillagerTrades }
                deleteHandler={ this.deleteVillager }
                editTradeHandler={ this.editTrade }
                deleteTradeHandler={ this.deleteTrade }
              />
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
              <Form.Control />
            </Form.Group>
            <Form.Group controlId="NewVillagerType">
              <Form.Label>Villager Type</Form.Label>
              <Form.Control />
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

export default TradeSet;