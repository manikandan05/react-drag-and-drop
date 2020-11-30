import './App.css';
import { Component } from 'react';
import { ParagraphTag } from "./component/Paragraph";
import { ButtonTag } from "./component/Button";
import { TextBoxTag } from "./component/InputText";
import { TextAreaTag } from "./component/TextArea";
import { HeadingTag } from "./component/Heading";

class App extends Component {

  //declare required private variables.
  dragWidgetName = {};
  state = {
    isToastHide: false,
    popup: {
      isModelOpen: false,
      x: '',
      y: ''
    },
    count: 0,
    widgets: [],
    dragElements: [
      {
        text: "Input Text",
        icon: "fa-i-cursor",
        type: "textbox"
      },
      {
        text: "Text Area",
        icon: "fa-text-width",
        type: "textarea"
      },
      {
        text: "Paragraph",
        icon: "fa-font",
        type: "paragraph"
      },
      {
        text: "Heading",
        icon: "fa-font",
        type: "heading"
      },
      {
        text: "Button",
        icon: "fa-square",
        type: "button"
      }
    ]
  }

  //History save support.
  histroySave = () => {
    const dragObject = { widget: this.state.widgets, count: this.state.count };
    window.localStorage.setItem("drag-widget", JSON.stringify(dragObject));
    this.setState({ isToastHide: true });
    setTimeout(() => {
      this.setState({ isToastHide: false });
    }, 1800)
  }

  //Update the component based on history availability.
  componentDidMount = () => {
    const localStorage = JSON.parse(window.localStorage.getItem("drag-widget"));
    if (localStorage && typeof (localStorage) === "object") {
      this.setState({ widgets: localStorage.widget, count: localStorage.count });
    }
    setInterval(() => {
      this.histroySave();
    }, 60000);
  }

  // Clear the local storage in clear button action
  clear = () => {
    window.localStorage.removeItem("drag-widget");
    this.setState({ widgets: [], count: 0 });
  }

  // Drag start action for left side pane widgets and store the drag widgets details in argument.
  dragStart = (type, args) => {
    args.dataTransfer.setData("type", type);
    this.widgetDetail(args);
  }

  // Common util method for get the element position.
  widgetDetail = (args) => {
    const position = args.currentTarget.getBoundingClientRect();
    return this.dragWidgetName = { x: args.clientX - position.left, y: args.clientY - position.top };
  }

  // Using Drag over event to prevent the action which helps drop operations.
  dragOver = (args) => {
    args.stopPropagation();
    args.preventDefault();
  }

  // Common drop method for process the element and update the state.
  drop = (args) => {
    const x = args.clientX - this.dragWidgetName.x;
    const y = args.clientY - this.dragWidgetName.y;
    const widget = { type: args.dataTransfer.getData("type"), x: x, y: y, id: ++this.state.count, isDrag: true };
    this.setState(prevState => ({
      widgets: [...prevState.widgets, widget]
    }));
    this.dragWidgetName = {};
    const model = this.state.popup;
    model.isModelOpen = true;
    model.x = x;
    model.y = y - 71;
    this.setState({ popup: model });
  }

  // Drag start for drop container area widgets
  widgetDragStart = (type, args) => {
    if (args.currentTarget.getAttribute("data-drag") === "false") {
      args.preventDefault();
    }
    args.dataTransfer.setData("type", type);
    const model = this.state.popup;
    model.isModelOpen = false;
    model.x = 0;
    model.y = 0;
    this.setState({ popup: model });
    this.widgetDetail(args);    
  }

  // Drag for drop container area widgets
  widgetDrag = (args) => {
    const dragWidget = this.state.widgets.filter(widget =>
      widget.id !== parseInt(args.currentTarget.getAttribute('id'))
    );
    this.setState({ widgets: dragWidget });
  }

  // Popup for widgets needs to to static or absolute
  popupClose = (...args) => {
    const model = this.state.popup;
    model.isModelOpen = args[2];
    this.setState({ popup: model });
    const dragID = parseInt(args[0].currentTarget.getAttribute('data-id'));
    if (!args[1]) {
      this.setState(prevState => ({
        widgets: prevState.widgets.map(el => (el.id === dragID ? {
          ...el, isDrag: false
        } : el))
      }))
    }
  }

  // Component for rendering the components in left side pane
  dragWidget = () => {
    return (<div className="row">
      {this.state.dragElements.map((element, i) => {
        return (<div key={i + "_widget"} className="row-item input" draggable onDragStart={(e) => this.dragStart(element.type, e)}>
          <span className={"fa " + element.icon}></span>
          <span className="text">{element.text}</span>
        </div>)
      })}
    </div>)
  }

  // Component for rendering the dragged components in drop area
  dropWidget = () => {
    return (<div className="drop-container" bounds="parent" onDrop={(e) => this.drop(e)} onDragOver={(e) => this.dragOver(e)}>
      {this.state.widgets.map((widget, i) => {
        return (
          <div className="component input-group" id={widget.id} data-drag={widget.isDrag} onDragStart={(e) => this.widgetDragStart(widget.type, e)} onDrag={(e) => this.widgetDrag(e)} key={widget.id} draggable style={{ top: widget.y + "px", left: widget.x + "px" }}>
            {<RenderWidget itemData={widget}></RenderWidget>}
          </div>
        )
      })}
    </div>)
  }

  render() {
    return (
      <div className="layout">
        <header>
          <span className="fa fa-bars"></span>
          <div className="header-content">
            <span>React UI Studio</span>
          </div>
          <button className="header-btn btn btn-warning" onClick={() => this.histroySave()}>Save</button>
        </header>
        <aside className="main-sidebar content-open">
          <this.dragWidget></this.dragWidget>
        </aside>
        <div className="drop-container content-open">
          <div className="dropArea">
            <this.dropWidget></this.dropWidget>
          </div>
          <div className="note-content">
            <span style={{ fontSize: "12px", color: '#b5b1b1' }}><i>* Changes will be auto saved in every 60 seconds</i></span>
            <span className="fa fa-trash" onClick={() => this.clear()} style={{ margin: '0 10px', cursor: 'pointer' }}>Clear</span>
          </div>
        </div>
        <div className={this.state.popup.isModelOpen ? "show popup" : "fade popup"} style={{ top: this.state.popup.y, left: this.state.popup.x }}>
          <span>Want to drag?</span>
          <hr />
          <button data-id={this.state.count} className="cancel glyphicon glyphicon-remove" onClick={(e) => this.popupClose(e, false, false)}></button>
          <button data-id={this.state.count} className="apply glyphicon glyphicon-ok" onClick={(e) => this.popupClose(e, true, false)}></button>
          <i className="arrow down"></i>
        </div>
        <div className={this.state.isToastHide ? "show toast" : "fade toast"}> Widget setting is auto saved!
        </div>
      </div>
    )
  }
}

// Based on condition component will render
const RenderWidget = props => {
  switch (props.itemData.type) {
    case "textbox": {
      return <TextBoxTag></TextBoxTag>
    }
    case "button": {
      return <ButtonTag></ButtonTag>
    }
    case "textarea": {
      return <TextAreaTag></TextAreaTag>
    }
    case "paragraph": {
      return <ParagraphTag></ParagraphTag>
    }
    case "heading": {
      return <HeadingTag></HeadingTag>
    }
    default: {
      return (console.log("No Widget Dragged"));
    }
  }
}

export default App;
