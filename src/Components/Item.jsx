import React from "react";

class Item extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let image = this.props.img === "item" ? 'url("/static/img/ItemCSS.png")' : 'url("/static/img/BlockCSS.png")';
    let name = null;
    if (this.props.showText) {
      name = <span>{ this.props.name }</span>;
    }
    return (
      <span>
        <span className="sprite" style={{"backgroundImage": image, "backgroundPosition": this.props.position }} />
        { name }
      </span>
    );
  }
}

export default Item;