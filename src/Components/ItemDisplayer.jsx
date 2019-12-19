import React from "react";

import Item from "./Item";

class ItemDisplayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: {}, ready: false}
  }
  
  componentDidMount() {
    let itemDict = {};
    let itemsStr = document.getElementById("appdata").dataset.itemDict;
    if (itemsStr) {
      itemDict = JSON.parse(itemsStr);
    }
    this.setState({items: itemDict, ready: true});
  }
  
  render() {
    if (this.props.name && this.state.ready) {
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

export default ItemDisplayer;