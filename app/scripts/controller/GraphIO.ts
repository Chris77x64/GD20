import {
    GraphComponent,
    GraphMLIOHandler,
    GraphMLSupport,
    StorageLocation
} from 'yfiles'

import {
    LiteEvent
} from "./../utils/liteevent";

import {KNode} from "../model/KNode";
import {KEdge} from "../model/KEdge";
import Papa from 'papaparse';

export class GraphIO {

    graphComponent: GraphComponent;

    vertexURL: string;
    edgeURL: string;

    vertexList: KNode[];
    edgeList: KEdge[];

    constructor(graphComponent: GraphComponent){

        this.graphComponent = graphComponent;

        this.vertexURL = "http://localhost:9003/csv/K-pop_node.csv";
        this.edgeURL = "http://localhost:9003/csv/K-pop_edge.csv";

        this.vertexList = [ ];
        this.edgeList = [ ];

        this.importFromCSV();
    }

    importFromCSV() {

        let numVertices = 0;
        let numEdges = 0;

        Papa.parse(this.vertexURL, {
            download: true,
            skipEmptyLines: true,
            step: (row) => {
                let node_id: number = parseInt(row.data[0])
                this.vertexList[numVertices] = new KNode(node_id, String(row.data[1]), String(row.data[2]), parseInt(row.data[3]));
                numVertices = numVertices +1;
            },
            complete: () => {
                Papa.parse(this.edgeURL, {
                    download: true,
                    skipEmptyLines: true,
                    step: (row) => {
                        this.edgeList[numEdges] = new KEdge(parseInt(row.data[0]), parseInt(row.data[1]));
                        numEdges = numEdges +1;
                    },
                    complete: () => {

                    },
                    error: (e)=>{console.log(e)}
                });
            },
            error: (e)=>{console.log(e)}
        });
        console.log('LOL: ',numVertices);
    }

    importFromGraphML() {

        this.graphComponent.graph.clear();

        let ioHandler = new GraphMLIOHandler();

        let graphMLObject = new GraphMLSupport({
            graphComponent: this.graphComponent,
            storageLocation: StorageLocation.FILE_SYSTEM,
            graphMLIOHandler: ioHandler
        })

        graphMLObject.openFile(this.graphComponent).then();
    }

    exportAsGraphML() {
        let ioHandler = new GraphMLIOHandler()
        let graphMLObject = new GraphMLSupport({
            graphComponent: this.graphComponent,
            storageLocation: StorageLocation.FILE_SYSTEM,
            graphMLIOHandler: ioHandler
        })
        graphMLObject.saveFile(this.graphComponent.graph).then();
    }

    exportAsCSV(csvName : string, csvAsString: string) {

        const a = document.createElement("a");
        a.style.display = "none";
        document.body.appendChild(a);

        a.href = window.URL.createObjectURL(
            new Blob([csvAsString], { type: "text/plain" })
        );

        a.setAttribute("download", csvName);
        a.click();

        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
    }

    download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

}