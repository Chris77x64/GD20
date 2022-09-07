import 'yfiles/yfiles.css';

import {
  License,
  GraphComponent,
  Class,
  LayoutExecutor,
} from 'yfiles'

import licenseJson from '../../license.json';

import {GraphController} from "./controller/GraphController";
import {GraphUI} from "./controller/GraphUI";

// Tell the library about the license.json contents
License.value = licenseJson;

// We need to load the yfiles/view-layout-bridge module explicitly to prevent the webpack
// tree shaker from removing this dependency which is needed for 'morphLayout' in this demo.
Class.ensure(LayoutExecutor);


/**
* A simple yFiles application that creates a GraphComponent and enables basic input gestures.
*/
class Graphenzeichnen {


  initialize() {
    // create a GraphComponent
    const graphComponent: GraphComponent = new GraphComponent('#graphComponent');
    const graphController:GraphController = new GraphController(graphComponent);
    const graphUI: GraphUI = new GraphUI(graphComponent,graphController);
  }

  constructor() {
    this.initialize();
  }

}

new Graphenzeichnen();
