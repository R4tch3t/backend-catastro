import React, { Component } from "react";
import { Page, Text, Document } from "@react-pdf/renderer";
import "./App.css";

class App extends React.Component {
  state = { url: null };
  onRender = ({ blob }) => {
    this.setState({ url: URL.createObjectURL(blob) });
  };
  render() {
    return (
      <React.Fragment>
        <Document shallow onRender={this.onRender}>
          <Page size="A4" wrap>
            <Text>I was created on the fly!</Text>
          </Page>
        </Document>
        <a href={this.state.url} download={`document.pdf`}>
          Download
        </a>
      </React.Fragment>
    );
  }
}
export default App;