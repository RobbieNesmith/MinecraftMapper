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
      let enchantment = null;
      if(this.props.enchantment) {
        enchantment = <span className="enchantment">{ this.props.enchantment }</span>
      }
      let title = this.props.name;
      if (this.props.count) {
        title = this.props.count + " " + this.props.name;
      }
      if (this.props.enchantment) {
        title = title + ` with ${this.props.enchantment}`;
      }
      return(
        <div className="itemDisplayer" title={ title }>
          <Item
            name={ this.props.name }
            img={ item.img }
            position={ item.position }
            showText={ false }
          />
          <span className="count">{ this.props.count }</span>
          { enchantment }
        </div>
      );
    } else {
      return null;
    }
  }
}

export default ItemDisplayer;
