import {
    GraphComponent,
    GraphItemTypes,
    GraphViewerInputMode,
    IEdge,
    IInputMode,
    IModelItem,
    INode,
    LassoSelectionEventArgs,
    LassoSelectionInputMode,
    MultiplexingInputMode,
    Point,
    TimeSpan
} from 'yfiles'

import dat, {GUI as DatGUI} from 'dat.gui';

import {
    getLayoutTypeString,
    layoutTarget,
    layoutTargetStringToEnum,
    layoutType,
    layoutTypeStringToEnum
} from "../view/GraphLayout";
import {HighlightIndicatorManagers} from "../view/HighlightIndicatorManagers";

import {GraphController} from "./GraphController";
import {KNode} from "../model/KNode";
import {GeneticLayoutRegions} from "../algorithm/GeneticLayoutRegions";
import {GeneticLayoutMain} from "../algorithm/GeneticLayoutMain";

export class GraphUI {

    graphComponent: GraphComponent
    graphController: GraphController
    dat_gui: DatGUI
    dat_guiUIElements: Map<string, dat.GUIController>
    gui_params
    highlightIndicatorsManagers : HighlightIndicatorManagers;
    ModeEnum
    current_mode


    constructor(graphComponent: GraphComponent, graphController: GraphController) {
        this.graphComponent = graphComponent;
        this.graphController = graphController;
        this.dat_gui = new dat.GUI();
        this.dat_guiUIElements = new Map();
        this.gui_params = {
            Data: 'Select...',
            Layout: 'Organic',
            ConnectedComponents: 3,
            "Read Graph Data": () => this.readGraph(),
            "Import GraphML File": () => this.importGraphUI(),
            "Export GraphML File": () => this.graphController.graphIO.exportAsGraphML(),
            "Display Text Labels": () => this.graphController.graphLabel.toggle(),
            "Fit Content": () => this.graphController.graphLayoutManager.zoomToContentRect(),
            "GA Label":() => {new GeneticLayoutRegions(this.graphComponent,this.graphController)},
            "GA Main":() => {new GeneticLayoutMain(this.graphComponent,this.graphController)}

        };

        this.highlightIndicatorsManagers = new HighlightIndicatorManagers(this.graphComponent);

        this.ModeEnum = Object.freeze({"exploration":0, "information":1})
        this.setDefaultMode();

        this.initializeDatGUI();
        this.initializeListeners();
    }

    readGraph() {
        this.graphController.initialize();
        document.getElementById("top_bar").style.visibility = "visible";
    }

    initializeDatGUI() {
        this.dat_guiUIElements.set('readGraphUiElement', this.dat_gui.add(this.gui_params, 'Read Graph Data'));
        this.dat_guiUIElements.set('importGraphGuiElement', this.dat_gui.add(this.gui_params, 'Import GraphML File'));
    }

    initializeListeners() {
        this.graphController.GraphLoaded.on((data) => {
            this.graphDisplayed(data);
            this.graphComponent.inputMode = this.createInputModeExpand();
        })
        this.graphController.GraphUpdated.on(() => 
            this.handleGraphUpdated()
        )
        this.graphController.ItemsOfInterestChanged.on(() =>
            this.handleItemsOfInterestChanged(this.graphController.itemsOfInterest)
        )
        document.getElementById("searchBar").addEventListener("input", () => this.displaySearchResults());
        document.getElementById("exitBtn").addEventListener("click", () => this.clearSearch(true));
        document.getElementById("mode_switch").addEventListener("click", () => this.switchMode());
    }

    setDefaultMode () {
        // Use ExplorationMode as default Mode
        this.setExplorationMode();
    }

    switchMode() {
        if (this.current_mode == this.ModeEnum.exploration) {
            this.setInformationMode()
        } else {
            this.setExplorationMode()
        }
    }

    setExplorationMode() {
        // Set mode
        this.current_mode = this.ModeEnum.exploration;

        // Adjust title
        const mode_name = document.getElementById("mode_name");
        mode_name.innerText = "Exploration Mode";

        // Hide Information Box
        const info_box = document.getElementById("information_box");
        info_box.style.display = "none";

        // TODO: Activate exploration mode listeners

    }

    setInformationMode() {
        // Set mode
        this.current_mode = this.ModeEnum.information;

        // Adjust title
        const mode_name = document.getElementById("mode_name");
        mode_name.innerText = "Information Mode";

        // Show Information Box
        const info_box = document.getElementById("information_box");
        info_box.style.display = "block";

        // TODO: Activate information mode listeners
    }

    handleGraphUpdated() {
        const hoverManager = this.highlightIndicatorsManagers.getHoverHIM();
        hoverManager.clearHighlights();
        this.handleItemsOfInterestChanged(this.graphController.getItemsOfInterest())
        this.displaySearchResults();
    }

    handleItemsOfInterestChanged(data: KNode[]) {
        const foundManager = this.highlightIndicatorsManagers.getFoundHIM();
        foundManager.clearHighlights();
        this.graphComponent.graph.nodes
            .filter(node => 
                data.find(knode => knode.id == node.tag) != null
            )
            .forEach(node => {
                foundManager.addHighlight(node)
            })
    }

    createInputModeExpand(): IInputMode {
        // create an input mode
        const multiplexingInputMode = new MultiplexingInputMode()
        const gi = new GraphViewerInputMode({
            toolTipItems: GraphItemTypes.LABEL_OWNER,
            clickableItems: GraphItemTypes.NODE,
            focusableItems: GraphItemTypes.NODE,
            selectableItems: GraphItemTypes.NONE,
            marqueeSelectableItems: GraphItemTypes.NONE
            });
        gi.priority = 5
        multiplexingInputMode.add(gi)

        const lassoInput: LassoSelectionInputMode = new LassoSelectionInputMode();
        lassoInput.priority = 4
        multiplexingInputMode.add(lassoInput)

        gi.navigationInputMode.useCurrentItemForCommands = true
        gi.addItemClickedListener((sender, args) => {
            if (args.item != null)
                this.nodeClicked(args.item)

            args.handled = true
        })
        
        gi.itemHoverInputMode.enabled = true
        gi.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
        gi.itemHoverInputMode.discardInvalidItems = false
        gi.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) =>
            this.itemHovered(evt.item)
        )
        
        gi.addQueryItemToolTipListener((sender, evt) => {
            evt.toolTip = this.nodeTooltipQueried(evt.item)
        })
        gi.mouseHoverInputMode.toolTipLocationOffset = new Point(0, 10)
        gi.mouseHoverInputMode.duration = new TimeSpan(0,0,0,10,0); //10s

        lassoInput.addDragFinishedListener((sender, args) => {
            this.selectedByLasso(args);
        })

        return multiplexingInputMode;
    }

    nodeClicked(n: IModelItem) {
        let nid = parseInt(n.tag);
        if (!isNaN(nid)) {
            this.graphController.expandNode(n);
        }
    }

    itemHovered(item: IModelItem) {
        const manager = this.highlightIndicatorsManagers.getHoverHIM();
        // remove previous highlights
        manager.clearHighlights()
        if(INode.isInstance(item)) {
            // highlight item and all adjacent edges
            manager.addHighlight(item);
            this.graphComponent.graph.edgesAt(item).forEach(edge => {
                manager.addHighlight(edge)
            });
        } else if(IEdge.isInstance(item)) {
            // highlight edge and their source and target
            manager.addHighlight(item);
            manager.addHighlight(item.sourceNode);
            manager.addHighlight(item.targetNode);
        }
    }

    nodeTooltipQueried(item: IModelItem) {
        if(INode.isInstance(item)) {
            const currentNode: INode = item;
            let currentName = this.graphController.kGraph.vertexName.get(currentNode);
            currentName = String(currentName);
            const toolTipText = currentName;
            // create rich html tooltip
            const text = document.createElement('p')
            text.innerHTML = toolTipText
            const tooltip = document.createElement('div')
            tooltip.appendChild(text)
            return tooltip;
        }
        return null;
    }

    selectedByLasso(args: LassoSelectionEventArgs) {
        this.graphController.removeNodesNotInArea(args.selectionPath);
    }

    importGraphUI() {
        this.clearGraphUI();
        this.graphController.graphIO.importFromGraphML();
    }

    clearGraphUI() {
        // this.graphController.clearGraph();

        let l = ["dataFilterGuiElement", "layoutAlgoGuiElement", "exportGraphGuiElement", "displayLabelsGuiElement"];
        l.forEach((el) => {
            if (this.dat_guiUIElements.has(el)) {
                let uiElement = this.dat_guiUIElements.get(el)
                uiElement.remove();
                this.dat_guiUIElements.delete(el)
            }
        });
    }

    clearSearch(clearSearchField: boolean) {
        const manager = this.highlightIndicatorsManagers.getSearchHIM();
        manager.clearHighlights();

        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            x[i].parentNode.removeChild(x[i]);
        }

        if (clearSearchField) {
            const inputField: HTMLInputElement = <HTMLInputElement>document.getElementById("searchBar");
            inputField.value = "";
            const exitBtn: HTMLDivElement = <HTMLDivElement>document.getElementById("exitBtn");
            exitBtn.style.visibility = "hidden";
        }
    }

    searchItemClicked(target: EventTarget) {
        this.clearSearch(true);
        const img: HTMLImageElement = <HTMLImageElement>target;
        //const manager = this.highlightIndicatorsManagers.getFoundHIM();

        let nid = parseInt(img.alt);
        if (!isNaN(nid)) {
            //manager.addHighlight(this.graphController.kGraph.vertexID[nid]);
            this.graphController.addNodeWithID(nid);
            this.graphController.addToItemsOfInterest(nid);
        }
    }

    starItemClicked(target: EventTarget) {
        this.clearSearch(true);
        const img: HTMLImageElement = <HTMLImageElement>target;
        //const manager = this.highlightIndicatorsManagers.getFoundHIM();

        let nid = parseInt(img.alt);
        if (!isNaN(nid)) {
            //manager.addHighlight(this.graphController.kGraph.vertexID[nid]);
            this.graphController.addToItemsOfInterest(nid);
            this.graphController.displayOnlyItemsOfInterest();
        }
    }

    searchListItemHover(target: EventTarget) {
        const starBtns = document.getElementsByClassName("starBtn");
        const searchBtns = document.getElementsByClassName("searchBtn");

        for (let i = 0; i < starBtns.length; i++) {
            (<HTMLElement>starBtns.item(i)).style.visibility = "hidden";
        }

        for (let i = 0; i < searchBtns.length; i++) {
            (<HTMLElement>searchBtns.item(i)).style.visibility = "hidden";
        }

        const htmlElement: HTMLElement = <HTMLElement>target;
        for (let i = 0; i < htmlElement.childNodes.length; i++) {
            if ((<HTMLElement>htmlElement.childNodes[i]).className == "starBtn" ||
                (<HTMLElement>htmlElement.childNodes[i]).className == "searchBtn") {
                (<HTMLElement>htmlElement.childNodes[i]).style.visibility = "visible";
            }
        }

    }

    displaySearchResults() {
        const inputField: HTMLInputElement = <HTMLInputElement>document.getElementById("searchBar");
        const exitBtn: HTMLDivElement = <HTMLDivElement>document.getElementById("exitBtn");
        const query: string = inputField.value.toLowerCase();
        const manager = this.highlightIndicatorsManagers.getSearchHIM();

        this.clearSearch(false);

        if (!query) {
            exitBtn.style.visibility = "hidden";
            return false;
        }

        exitBtn.style.visibility = "visible";

        let a = document.createElement("DIV");
        a.setAttribute("id", inputField.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        inputField.parentNode.appendChild(a);

        const nodes: KNode[] = this.graphController.kGraph.vertexList;
        let findings: KNode[] = [];

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].name.toLowerCase().includes(query)) {
                findings.push(nodes[i]);
            }
        }

        // highlight all findings
        if(query.length > 1) {
            this.graphComponent.graph.nodes
                .filter(node => 
                    findings.find(knode => knode.id == node.tag) != null
                )
                .forEach(node => {
                    manager.addHighlight(node)
                })
        }

        findings.sort(function (a, b) {
            const a_name: string = a.name.toLowerCase();
            const b_name: string = b.name.toLowerCase();

            if (a_name.startsWith(query) && !b_name.startsWith(query)) {
                return -1;
            } else if (!a_name.startsWith(query) && b_name.startsWith(query)) {
                return 1;
            }

            if (a_name.length < b_name.length) {
                return -1;
            } else if (a_name.length > b_name.length) {
                return 1;
            }

            return a_name.localeCompare(b_name);
        });

        for (let i = 0; i < Math.min(findings.length, 12); i++) {
            let b = document.createElement("DIV");
            b.setAttribute("class", "searchItem");

            let original: string = findings[i].name;
            let original_lowercase: string = original.toLowerCase();
            let queryIndexStart: number = original_lowercase.indexOf(query);
            let first: string = queryIndexStart == 0 ? "" : original.substr(0, queryIndexStart);
            let second: string = original.substr(queryIndexStart, query.length);
            let third: string = queryIndexStart + query.length == original.length ? "" : original.substr(queryIndexStart + query.length, original.length - (queryIndexStart + query.length));

            let color: string = "red";

            switch (findings[i].type) {
                case "label":
                    color = "orange";
                    break;
                case "group":
                    color = "red";
                    break;
                case "person":
                    color = "lightgreen";
                    break;
                case "male":
                    color = "lightblue";
                    break;
                case "female":
                    color = "pink";
                    break;
                default:
                    color = "black";
                    break;
            }

            b.innerHTML = "<span style=\"color:" + color + ";\">&#9724;</span> " + first + "<strong>" + second + "</strong>" + third;
            b.innerHTML += "<img alt='" + findings[i].id + "' class='starBtn' src='img/star_black.png'>";
            b.innerHTML += "<img alt='" + findings[i].id + "' class='searchBtn' src='img/search_black.png'>";

            a.appendChild(b);
        }

        const starBtns = document.getElementsByClassName("starBtn");
        const searchBtns = document.getElementsByClassName("searchBtn");
        const searchItems = document.getElementsByClassName("searchItem");

        for (let i = 0; i < starBtns.length; i++) {
            starBtns[i].addEventListener('click', evt => this.starItemClicked(evt.target), false);
            starBtns[i].addEventListener('mouseover', evt => this.hoverStar(evt.target))
            starBtns[i].addEventListener('mouseout', evt => this.unhoverStar(evt.target))
        }

        for (let i = 0; i < searchBtns.length; i++) {
            searchBtns[i].addEventListener('click', evt => this.searchItemClicked(evt.target), false);
            searchBtns[i].addEventListener('mouseover', evt => this.hoverSearch(evt.target))
            searchBtns[i].addEventListener('mouseout', evt => this.unhoverSearch(evt.target))
        }

        for (let i = 0; i < searchItems.length; i++) {
            searchItems[i].addEventListener('mouseenter', evt => this.searchListItemHover(evt.target), false);
        }

    }

    graphDisplayed(imported: boolean) {

        let l = ["readGraphUiElement", "importGraphGuiElement"];
        l.forEach((el) => {
            if (this.dat_guiUIElements.has(el)) {
                let uiElement = this.dat_guiUIElements.get(el)
                uiElement.remove();
                this.dat_guiUIElements.delete(el)
            }
        });

        if (!this.dat_guiUIElements.has('exportGraphGuiElement')) {
            this.dat_guiUIElements.set('exportGraphGuiElement', this.dat_gui.add(this.gui_params, 'Export GraphML File'));
        }

        if (!this.dat_guiUIElements.has('dataFilterGuiElement') && !imported) {
            this.dat_guiUIElements.set('dataFilterGuiElement', this.dat_gui.add(this.gui_params, 'Data', ['Select...', 'All', 'Labels', 'Groups', 'Individuals', 'Male', 'Female', 'Other']).onChange((data) => {

                let numComps = this.gui_params.ConnectedComponents;
                let currentLayoutTarget = layoutTargetStringToEnum(data);
                this.graphController.graphLayoutManager.currentTarget = currentLayoutTarget;
                let currentLayoutType = layoutTypeStringToEnum(this.gui_params.layout);
                if (currentLayoutType == undefined) {
                    currentLayoutType = layoutType.Organic;
                }

                this.graphController.showGraph(currentLayoutTarget, numComps);
                this.graphController.graphLayoutManager.applyLayout(currentLayoutType, currentLayoutTarget);
            }));
        }

        if (!this.dat_guiUIElements.has('layoutAlgoGuiElement')) {
            this.dat_guiUIElements.set('layoutAlgoGuiElement', this.dat_gui.add(this.gui_params, 'Layout', getLayoutTypeString()).onChange((layout) => {
                this.gui_params.layout = layout;
                let currentLayoutTarget = layoutTargetStringToEnum(this.gui_params.Data);
                let currentLayoutType = layoutTypeStringToEnum(layout);
                this.graphController.graphLayoutManager.currentLayout = currentLayoutType;
                this.graphController.graphLayoutManager.applyLayout(currentLayoutType, currentLayoutTarget);
            }));
        }
        this.dat_guiUIElements.set('SCC', this.dat_gui.add(this.gui_params, 'ConnectedComponents', this.graphController.getComponents()).onChange((val) => {

            let currentLayoutTarget = layoutTargetStringToEnum(this.gui_params.Data);
            let currentLayoutType = layoutTypeStringToEnum(this.gui_params.layout);

            this.graphController.showGraph(currentLayoutTarget, val);
            this.graphController.graphLayoutManager.applyLayout(currentLayoutType, currentLayoutTarget);
        }));

        if (!this.dat_guiUIElements.has('displayLabelsGuiElement')) {
            this.dat_guiUIElements.set('displayLabelsGuiElement', this.dat_gui.add(this.gui_params, 'Display Text Labels').onChange((val) => {
                //this.graphController.setDisplayTextLabels(val);
            }));
        }
        this.dat_guiUIElements.set('FitContentGuiElement', this.dat_gui.add(this.gui_params, 'Fit Content'));

        this.dat_guiUIElements.set('importlayout4', this.dat_gui.add(this.gui_params, 'GA Label'));
        this.dat_guiUIElements.set('importlayout5', this.dat_gui.add(this.gui_params, 'GA Main'));

    }

    hoverStar(element) {
        element.setAttribute('src', 'img/star_blue.png');
    }

    unhoverStar(element) {
        element.setAttribute('src', 'img/star_black.png');
    }

    hoverSearch(element) {
        element.setAttribute('src', 'img/search_blue.png');
    }

    unhoverSearch(element) {
        element.setAttribute('src', 'img/search_black.png');
    }
}