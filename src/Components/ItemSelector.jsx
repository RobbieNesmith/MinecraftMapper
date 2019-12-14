import React from "react";

import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import FormControl from "react-bootstrap/FormControl";

import Item from "./Item";

class ItemSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: {}, selected: null, filterVal: ""};
  }

  componentDidMount() {
    let itemDict = {}
    let itemsStr = document.getElementById("appdata").dataset.itemDict;
    if (itemsStr) {
      itemDict = JSON.parse(itemsStr);
    }
    this.setState({items: itemDict});
  }

  render() {
    let dropdownText = "???";
    if (this.state.selected) {
      dropdownText = <Item
        name={ this.state.selected }
        img={ this.state.items[this.state.selected].img }
        position={ this.state.items[this.state.selected].position }
        showText={ false }
      />
    }
    return(
      <div title={ this.state.selected }>
        <Dropdown>
          <Dropdown.Toggle variant="light">
            { dropdownText }
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>
              <FormControl
                autoFocus
                className="mx-3 my-2 w-auto"
                placeholder="Type to filter..."
                onChange={e => this.setState({ filterVal: e.target.value })}
                value={this.state.filterVal}
              />
            </Dropdown.Header>
              <div className="dropdownScroller">
              { Object.keys(this.state.items).filter(i => i.toLowerCase().includes(this.state.filterVal.toLowerCase())).map((itemName, index) => {
                return (
                  <Dropdown.Item
                    onClick={ ()=>this.setState({selected: itemName}) }
                  >
                    <Item
                      name={ itemName }
                      img={ this.state.items[itemName].img }
                      position={ this.state.items[itemName].position }
                      showText={ true }
                    />
                  </Dropdown.Item>
                )})
              }
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}

export default ItemSelector;