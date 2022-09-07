import {
    Color,
    EdgeBundlingStage, EdgeList,
    GraphComponent,
    ICanvasObjectDescriptor,
    IEnumerable,
    INode,
    YNodeList,
    YPoint,
    YRectangle
} from 'yfiles'

import {SweepLine} from "./SweepLine";
import {SimplyConnectedGraph} from "../model/subgraph/SimplyConnectedGraph";
import LimitedRectangleDescriptor from "../model/subgraph/LimitedRectangleDescriptor";
import {GraphController} from "../controller/GraphController";
import {KGraph} from "../model/KGraph";
import Papa from 'papaparse';
import BlobBackground from "./Blobs";

export class GeneticLayoutRegions {

    graphComponent: GraphComponent
    sweepLine: SweepLine
    kGraph : KGraph
    model: SimplyConnectedGraph

    partitions: YNodeList[]
    rectangles: YRectangle[]
    nodeArr: INode[]

    vertices: YNodeList

    rectangleWidth: number
    rectangleHeight: number

    mutations: number
    swaps: number
    population: number
    iterations: number
    selectionPressure: number
    mutationDecay: number


    constructor(graphComponent: GraphComponent, graphController: GraphController) {

        this.initialize(graphComponent,graphController);
        this.initializeParameter();

        this.calculatePartitions();
        this.calculateRectangles();

        /*
        Either compute layout from scratch
         */

        //this.genetic();

        /*
        Or import preexisting layout from csv
         */
        this.importPopulation();

        this.update(graphController);

    }


    removeLabels(){

        let re = new EdgeList();

        this.vertices.forEach(currentVertex =>{
            let type = this.kGraph.vertexType.get(currentVertex);
            if( type ==  'label' ){
                let consideredEdges = this.graphComponent.graph.edgesAt(currentVertex);
                consideredEdges.forEach(currentEdge =>{
                    let source = currentEdge.sourceNode;
                    let target = currentEdge.targetNode;

                    if( this.vertices.includes(source) && this.vertices.includes(target) ) {
                        re.addFirst(currentEdge);
                    }
                });
            }
        })

        re.forEach(cr =>{
            this.graphComponent.graph.remove(cr);
        })
    }

    initialize(graphComponent: GraphComponent, graphController: GraphController){
        this.graphComponent = graphComponent;
        graphController.currentGraph = new SimplyConnectedGraph(graphComponent, graphController.kGraph);
        this.model = graphController.currentGraph;
        this.kGraph = graphController.kGraph;
        this.sweepLine = new SweepLine();
    }

    update(graphController: GraphController ){
        this.graphComponent.setContentRect(0, 0, 4 * this.rectangleWidth, 4 * this.rectangleHeight);
        graphController.graphStyle.update(graphController.kGraph);
        this.graphComponent.fitContent();
    }

    blobs(partition){

        let colors = [
            new Color(179, 255, 255),
            new Color(217, 255, 179),
            new Color(255, 153, 0),
            new Color(0, 191, 255),
            new Color(0, 255, 0),
            new Color(255, 0, 0),
            new Color(0, 153, 204),
            new Color(64, 255, 0),
            new Color(0, 0, 179),
            new Color(0, 255, 255),
            new Color(255, 0, 255),
            new Color(255, 51, 0),
            new Color(0, 230, 0),
            new Color(26, 26, 255),
            new Color(128, 0, 255),
            new Color(0, 117, 153)

        ];

        for (let k= 0; k < 16; k++){

            let consideredVertices = new YNodeList();
            for( let i=0; i < partition.length; i++){
                let currentPartition = partition[i];
                let currentNode = this.nodeArr[i];
                if( currentPartition == k){
                    consideredVertices.addFirst(currentNode);
                }
            }

            this.graphComponent.backgroundGroup.addChild(
                new BlobBackground(
                    n =>
                        consideredVertices.includes(n),
                    colors[k], 310
                ),
                ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
            )
        }


    }

    bundling(){

        let stage = new EdgeBundlingStage();
        stage.edgeBundling.bundlingQuality = 0.999;
        stage.edgeBundling.bundlingStrength = 0.999;

       this.graphComponent.graph.applyLayout(stage);

    }

    initializeParameter(){

        this.rectangleWidth = 4000;
        this.rectangleHeight = 2000;
        this.mutations = 0.001;//0.21; //0.05;
        this.swaps = 0;
        this.population = 15;
        this.iterations = 1;
        this.selectionPressure = 700;
        this.mutationDecay = 0.01;//0.05;//0.07;
    }

    rouletteWheel(fitness) : number[]{
        let mapping = this.exponentialMapping(fitness);
        let sum = this.calculateSum(mapping);

        let result = [];
        for( let i=0; i < fitness.length; i++){
            result[i] = mapping[i]/sum;
        }
        return result;
    }
    applyResult(finalPopulation,currentFitness){
        let argMin = this.calculateArgMin(currentFitness);
        let min = currentFitness[argMin];
        let minPopulation = finalPopulation[argMin];
        this.applyIndividual(minPopulation);
        console.log('MINIMUM NUMBER OF CROSSINGS: ',min);
    }


    calculateSum(input: number[]): number{
        let sum = 0;
        for( let i=0; i < input.length; i++){
            sum += input[i];
        }
        return sum;
    }

    calculateArgMax(input: number[]): number{
        let max = Number.MIN_VALUE;
        let maxIndex = -1;
        for( let i=0; i < input.length; i++){
            if( input[i] > max){
                max = input[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }

    calculateArgMin(input: number[]): number{
        let min = Number.MAX_VALUE;
        let minIndex = -1;
        for( let i=0; i < input.length; i++){
            if( input[i] < min){
                min = input[i];
                minIndex = i;
            }
        }
        return minIndex;
    }

    calculateMaximum(input: number[]): number {
        let indexMax = this.calculateArgMax(input);
        return input[indexMax];
    }


    exponentialMapping( fitness): number[] {
        let maxFitness = this.calculateMaximum(fitness);
        let result = [];
        for( let i=0; i < fitness.length; i++){
            let exponent = - this.selectionPressure * (fitness[i]/maxFitness);
            result[i] = Math.exp(exponent);
        }
        return result;
    }

    calculateCDF(wheelProbabilities){
        let result = [];
        let sum = 0;
        for( let i=0; i < wheelProbabilities.length; i++){
            sum = sum + wheelProbabilities[i];
            result[i] = sum;
        }
        return result;
    }

    calculatePopulationFitness(population){
        let result = [];

        for( let i=0; i < population.length; i++){
            let currentIndividual = population[i];
            result[i] = this.fitness(currentIndividual);
        }
        return result;
    }

    geneticAsynchronous(initialPopulation,initialPopulationPartition){
        let count = 0;

        let population = initialPopulation;
        let populationPartitions = initialPopulationPartition;
        let fitness = this.calculatePopulationFitness(population);

        console.log('INITIAL FITNESS: ',fitness);

        for( let iteration = 0; iteration < this.iterations; iteration++){

            let wheelProbabilities = this.rouletteWheel(fitness);
            let wheelCDF = this.calculateCDF(wheelProbabilities);

            console.log(fitness);
            console.log(wheelProbabilities);
            console.log('MUTATION RATE: ',this.mutations);

            let result = this.selection(population,populationPartitions,wheelCDF,fitness);

            population = result[0];
            populationPartitions = result[1];
            fitness = result[2];

            if( this.mutations > 0.05) {

                this.mutations = (1 - this.mutationDecay) * this.mutations;
            }
            else if( this.mutations < 0.05 && count < 25){
                this.mutationDecay = 0.0005;//0.0125
                count=count+1;
            }
            else{
                this.mutations = 0.0005; //0.05//0.11;
                count = 0;
            }
        }

        this.exportLayoutCSV(population);
        this.applyResult(population,fitness);
        //this.bundling();
        this.visualizePopulation(population);
    }

    genetic(){

        let count = 0;

        let initialData = this.generatePopulation();//[]; //this.generatePopulation();
       // initialData[0] = this.importPopulationCSV(); //this.importLayoutCSV()//this.importFROMCSV();//this.generatePopulation(); //this.importFROMCSV(); //this.generatePopulation(); // this.importFROMCSV();
      //  initialData[2] = this.calculatePopulationFitness(initialData[0]);

        let population = initialData[0];
        let populationPartitions = initialData[1];
        let fitness = initialData[2];

         console.log('INITIAL FITNESS: ',fitness);

        for( let iteration = 0; iteration < this.iterations; iteration++){

            let wheelProbabilities = this.rouletteWheel(fitness);
            let wheelCDF = this.calculateCDF(wheelProbabilities);

            console.log(fitness);
            console.log(wheelProbabilities);
            console.log('MUTATION RATE: ',this.mutations);

            let result = this.selection(population,populationPartitions,wheelCDF,fitness);

            population = result[0];
            populationPartitions = result[1];
            fitness = result[2];

            if( this.mutations > 0.05) {

                this.mutations = (1 - this.mutationDecay) * this.mutations;
            }
            else if( this.mutations < 0.05 && count < 25){
                this.mutationDecay = 0.025
                count=count+1;
            }
            else{
                this.mutations = 0.11;
                count = 0;
            }
        }
        this.exportRegions(populationPartitions);
        this.exportLayoutCSV(population);
        this.applyResult(population,fitness);
    }

    download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    exportLayoutCSV(finalPopulation){

        for( let i=0; i < finalPopulation.length; i++) {
            let resultCSV = 'id,x,y\n';

            let currentIndividual = finalPopulation[i];

            for( let k=0; k < currentIndividual.length; k++){
                let currentPoint = currentIndividual[k];
                let currentVertex = this.nodeArr[k];
                let currentID = currentVertex.tag;
                resultCSV += (currentID+","+currentPoint.x+ "," + currentPoint.y+"\n");
            }

            resultCSV = resultCSV.substr(0,resultCSV.length-1);

            this.download("l"+i+".csv",resultCSV);
        }
    }


    exportRegions(finalPartitions){
        for( let i=0; i < finalPartitions.length; i++){
            let currentPartition = finalPartitions[i];
            let resultCSV = 'nodeid,partitionid\n';
            for( let k=0; k < currentPartition.length; k++){
                let currentIndex = currentPartition[k];
                let currentVertex = this.nodeArr[k];
                let currentID = currentVertex.tag;
                resultCSV += (currentID+","+currentIndex+"\n");
            }
            resultCSV = resultCSV.substr(0,resultCSV.length-1);

            this.download("r"+i+".csv",resultCSV);
        }

    }

    visualizePopulation(population){
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const yourFunction = async () => {

            for( let i=0; i < population.length; i++){
                let currentIndividual = population[i];
                this.applyIndividual(currentIndividual);
                this.graphComponent.fitContent();
                await delay(5000);
            }

        };
       let visualization = yourFunction();
    }

    calculateKLargestLabels( K: number){
        let sortedLabels = this.model.labelSet.orderBy(
            entry => entry,
            (item1: INode, item2: INode) => ( this.graphComponent.graph.degree(item1) > this.graphComponent.graph.degree(item2) ? -1 : 1));
        return sortedLabels.take(K);
    }

    calculateVertices(labels: IEnumerable<INode>){
        let result = new YNodeList();
        labels.forEach(currentLabel =>{
            let currentNeighbourhood = this.graphComponent.graph.neighbors(currentLabel);
            currentNeighbourhood.forEach(currentNeighbour =>{
                if( !result.includes(currentNeighbour) && !this.model.labelSet.includes(currentNeighbour)){
                    result.addFirst(currentNeighbour);
                }
            })
        });
        return result;
    }

    edgeExists(vertex1: INode, vertex2: INode){
        if( this.graphComponent.graph.getEdge(vertex1,vertex2) != null ||
            this.graphComponent.graph.getEdge(vertex2,vertex1) != null){
            return true;
        }
        else{
            return false;
        }
    }

    calculatePartitions(){
        let ll = this.calculateKLargestLabels(16);
        let reversedSort = ll.toReversed();

        let consideredVertices = this.calculateVertices(ll);

        this.partitions = [];
        let reversedSortArr = [];

        for( let i=0; i < reversedSort.size; i++){
            let currentLabel = reversedSort.elementAt(i);
            reversedSortArr.push(currentLabel);
            this.partitions[i] = new YNodeList();
            this.partitions[i].addFirst(currentLabel);
        }

         consideredVertices.forEach(currentVertex =>{
             for( let i=0; i < reversedSortArr.length; i++){
                 let currentLabel: INode = reversedSortArr[i];
                 if( this.edgeExists(currentVertex,currentLabel)){
                     this.partitions[i].addFirst(currentVertex);
                 }
             }
         });

         ll.forEach(currentLabel=>{
             consideredVertices.addFirst(currentLabel);
         })

        this.vertices = consideredVertices;
        this.model.filterSet(consideredVertices);
    }


    fitness( individual: YPoint[] ): number{

        this.applyIndividual(individual);
        return this.sweepLine.calculateCrossings(this.graphComponent.graph);
    }

    offsprings( population,populationPartition,wheelCDF){

        let resultPopulation = [];
        let resultPopulationPartition = [];
        let resultFitness = [];

        for (let i = 0; i < population.length; i++) {
            let selectedIndex = this.selectIndividual(population, wheelCDF);

            let newIndividual = this.cloneIndividual(population[selectedIndex]);
            let newPartition = this.clonePartitions(populationPartition[selectedIndex]);

            this.crossover(newIndividual, newPartition);
            this.mutate(newIndividual, newPartition);

            let newFitness = this.fitness(newIndividual);

            resultPopulation.push(newIndividual);
            resultPopulationPartition.push(newPartition);
            resultFitness.push(newFitness);

        }
        return [resultPopulation,resultPopulationPartition,resultFitness];
    }

    indexSort(fitness){
        let index = [];
        for( let i=0; i < fitness.length; i++){
            index[i] = i;
        }
        index.sort( (index1,index2) =>{
             return fitness[index1] > fitness[index2] ? 1 : -1
        });
        return index;
    }

    merge(oldPopulation,oldPopulationPartition,oldFitness,offspring){

        let offspringPopulation = offspring[0];
        let offspringPopulationPartition = offspring[1];
        let offspringFitness = offspring[2];

        let resultPopulation = [];
        let resultPopulationPartition = [];
        let resultFitness = [];

        let offspringIndexSort = this.indexSort(offspringFitness);
        let oldIndexSort = [];

        let indexA = 0;
        let indexB = 0;

        for (let i = 0; i < oldPopulation.length; i++) {

            oldIndexSort.push(i);

            let indexOld = oldIndexSort[indexA];
            let indexOffspring = offspringIndexSort[indexB];

            if( oldFitness[indexOld] <= offspringFitness[indexOffspring] ){
                resultPopulation.push(oldPopulation[indexOld]);
                resultPopulationPartition.push(oldPopulationPartition[indexOld]);
                resultFitness.push(oldFitness[indexOld]);
                indexA = indexA +1;
            }
            else{
                resultPopulation.push(offspringPopulation[indexOffspring]);
                resultPopulationPartition.push(offspringPopulationPartition[indexOffspring]);
                resultFitness.push(offspringFitness[indexOffspring]);
                indexB = indexB +1;
            }
        }
        return [resultPopulation,resultPopulationPartition,resultFitness];
    }
    /*
    returns new population,populationPartition ordered by fitness
     */

    selection( population,populationPartition,wheelCDF,fitnessPopulation){

        let offspring = this.offsprings(population,populationPartition,wheelCDF);
        return this.merge(population,populationPartition,fitnessPopulation,offspring);
    }

    selectIndividual( population,wheelCDF ): number{
        let random = Math.random();

        if( random < wheelCDF[0]){
            return 0;
        }
        else {
            for (let i = 1; i < wheelCDF.length; i++) {
                let previousVal = wheelCDF[i-1];
                let currentVal = wheelCDF[i];

                if( (random >= previousVal) && (random < currentVal)){
                    return i;
                }
            }
        }
    }

    /*
    inplace
     */

    crossover(individual: YPoint[],partitions: number[]){
        let numSwaps = Math.floor(Math.random()*(this.swaps+1));
        for( let i = 0; i < numSwaps; i++){
            let randomIndexFirst = Math.floor(Math.random()*16);
            let randomIndexSecond = Math.floor(Math.random()*16);
            this.swapRectangles(individual,partitions,randomIndexFirst,randomIndexSecond);
        }
    }

    /*
    inplace
     */
    mutate(individual: YPoint[], partitions: number[]){

       // let accepted = [4,8];

        for( let k = 0; k < individual.length ; k++){

            /*
            if( !accepted.includes(partitions[k])){
                continue;
            }
             */
            
            let random = Math.random();
            if ( random <= this.mutations){
                let currentIndex = partitions[k];
                individual[k] = this.generatePosition(currentIndex);
            }
        }
    }

    /*
    fastest way to duplicate arr in firefox 78
     */
    cloneIndividual(individual: YPoint[]): YPoint[]{
        let result: YPoint[] = []
        let i = individual.length;
        while (i--) result[i] = individual[i];
        return result;
    }

    clonePartitions(partitions: number[]): number[]{
        let result: number[] = [];
        let i = partitions.length;
        while (i--) result[i] = partitions[i];
        return result;
    }


    /*
    inplace
     */
    swapRectangles( individual: YPoint[], partitions: number[], firstIndex: number, secondIndex: number){

        let rectangleFirst: YRectangle = this.rectangles[firstIndex];
        let rectangleSecond: YRectangle = this.rectangles[secondIndex];

        let originFirst: YPoint = new YPoint(rectangleFirst.x,rectangleFirst.y);
        let originSecond: YPoint = new YPoint(rectangleSecond.x,rectangleSecond.y);

        for( let i=0; i < partitions.length; i++){

            let currentPartition = partitions[i];
            let currentPoint: YPoint = individual[i];
            let normalizedPoint : YPoint;

            switch (currentPartition) {
                case firstIndex:
                    normalizedPoint = YPoint.subtract(currentPoint,originFirst);
                    individual[i] = YPoint.add(normalizedPoint,originSecond);
                    partitions[i] = secondIndex;
                    break;
                case secondIndex:
                    normalizedPoint = YPoint.subtract(currentPoint,originSecond);
                    individual[i] = YPoint.add(normalizedPoint,originFirst);
                    partitions[i] = firstIndex;
                    break;
                default:
            }
        }
    }

    calculateRectangles( ){
        this.rectangles = [];

        let gridHeight = 4;
        let gridWidth = 4

        for( let row=0; row < gridHeight; row++){
            for( let col=0; col < gridWidth; col++){
                let currentRect = new YRectangle(col*this.rectangleWidth,(row)*this.rectangleHeight,this.rectangleWidth,this.rectangleHeight);
                this.rectangles.push(currentRect);
                //this.graphComponent.highlightGroup.addChild(currentRect,new LimitedRectangleDescriptor());
            }
        }
        console.log('LOCATION',this.rectangles[11].location);
    }

    partitionLookup(inputVertex: INode){
        for( let i=0; i < this.partitions.length; i++){
            if( this.partitions[i].includes(inputVertex)){
                return i;
            }
        }
        return -1;
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    createRandomizedPartition(){
        let result = [];
        let translatedPartitions = [];
        for( let i=0; i < 16; i++){
            translatedPartitions.push(i);
        }
        translatedPartitions = this.shuffle(translatedPartitions);

        for( let i=0; i < this.nodeArr.length; i++){
            let currentNode = this.nodeArr[i];
            let currentPartition = this.partitionLookup(currentNode);
            result[i] = translatedPartitions[currentPartition];
        }
        return result;
    }

    translateRegions(population){
        let result = [];
        for( let i=0; i < population.length; i++){
            let currentPartition = [];
            this.applyIndividual(population[i]);
            for( let nodeIndex = 0; nodeIndex < this.nodeArr.length; nodeIndex++){
                let currentNode = this.nodeArr[nodeIndex];
                let currentPosition = currentNode.layout.center.toYPoint();
                for( let rectangleIndex = 0; rectangleIndex< this.rectangles.length; rectangleIndex++){
                    let currentRectangle = this.rectangles[rectangleIndex];
                    if( YRectangle.contains(currentRectangle.location.x,currentRectangle.location.y,this.rectangleWidth,this.rectangleHeight,currentPosition.x,currentPosition.y)){
                        currentPartition.push(rectangleIndex);
                        break;
                    }
                }

            }
            result.push(currentPartition);
        }

        return result;
    }

    customParse(url, stepArr){
        return new Promise(function(resolve, reject){
            let first = true;
            Papa.parse(url, {
                download:true,
                step: function(row){
                    if( first){
                        first = false;
                    }
                    else {
                        let x = Number(row.data[1]);
                        let y = Number(row.data[2]);
                        stepArr.push(new YPoint(x, y));
                    }
                },
                complete: resolve
            });
        });
    }


    importPopulation(){

        let population = [ ];
        this.nodeArr = this.graphComponent.graph.nodes.toArray();

        let individual0 = [];
        let i0 = this.customParse("http://localhost:9003/csv/genetic/l"+0+".csv",individual0);
        let individual1 = [];
        let i1 = this.customParse("http://localhost:9003/csv/genetic/l"+1+".csv",individual1);
        let individual2 = [];
        let i2 = this.customParse("http://localhost:9003/csv/genetic/l"+2+".csv",individual2);
        let individual3 = [];
        let i3 = this.customParse("http://localhost:9003/csv/genetic/l"+3+".csv",individual3);
        let individual4 = [];
        let i4 = this.customParse("http://localhost:9003/csv/genetic/l"+4+".csv",individual4);
        let individual5 = [];
        let i5 = this.customParse("http://localhost:9003/csv/genetic/l"+5+".csv",individual5);
        let individual6 = [];
        let i6 = this.customParse("http://localhost:9003/csv/genetic/l"+6+".csv",individual6);
        let individual7 = [];
        let i7 = this.customParse("http://localhost:9003/csv/genetic/l"+7+".csv",individual7);
        let individual8 = [];
        let i8 = this.customParse("http://localhost:9003/csv/genetic/l"+8+".csv",individual8);
        let individual9 = [];
        let i9 = this.customParse("http://localhost:9003/csv/genetic/l"+9+".csv",individual9);
        let individual10 = [];
        let i10 = this.customParse("http://localhost:9003/csv/genetic/l"+10+".csv",individual10);
        let individual11 = [];
        let i11 = this.customParse("http://localhost:9003/csv/genetic/l"+11+".csv",individual11);
        let individual12 = [];
        let i12 = this.customParse("http://localhost:9003/csv/genetic/l"+12+".csv",individual12);
        let individual13 = [];
        let i13 = this.customParse("http://localhost:9003/csv/genetic/l"+13+".csv",individual13);
        let individual14 = [];
        let i14 = this.customParse("http://localhost:9003/csv/genetic/l"+14+".csv",individual14);

        Promise.all([i0,i1,i2,i3,i4,i5,i6,i7,i8,i9,i10,i11,i12,i13,i14]).then(()=>{
            population.push(individual0);
            population.push(individual1);
            population.push(individual2);
            population.push(individual3);
            population.push(individual4);
            population.push(individual5);
            population.push(individual6);
            population.push(individual7);
            population.push(individual8);
            population.push(individual9);
            population.push(individual10);
            population.push(individual11);
            population.push(individual12);
            population.push(individual13);
            population.push(individual14);



            let populationPartition = this.translateRegions(population);

            /*
            Either run algorithm on csv input
             */
            //this.geneticAsynchronous(population,populationPartition);

            /*
            Or visualize existing results
             */
            this.applyIndividual(population[0]);
            this.removeLabels();
            this.bundling();

            //this.blobs(populationPartition[0])
            //this.visualizePopulation(population)

        })


    }


    generatePopulation(){

        this.nodeArr = this.graphComponent.graph.nodes.toArray();
        let resultPopulation = [];
        let resultPartition = [];
        let resultFitness = [];

        for( let i=0; i < this.population; i++){
            let calculation = this.generateIndividual();

            let newIndividual = calculation[0];
            let newPartition = calculation[1];
            let newFitness = this.fitness(newIndividual);

            resultPopulation.push(newIndividual);
            resultPartition.push(newPartition);
            resultFitness.push(newFitness);
        }

        let indexOrder = this.indexSort(resultFitness);

        let sortedPopulation = [];
        let sortedPartition = [];
        let sortedFitness = [];

        for(let i=0; i < indexOrder.length; i++){
            let currentIndex = indexOrder[i];
            let currentIndividual =  resultPopulation[currentIndex];
            let currentPartition = resultPartition[currentIndex];
            let currentFitness = resultFitness[currentIndex];

            sortedPopulation.push(currentIndividual);
            sortedPartition.push(currentPartition);
            sortedFitness.push(currentFitness);
        }

        return [sortedPopulation,sortedPartition,sortedFitness];
    }


    generatePosition(indexPartition: number): YPoint{

        let rect: YRectangle = this.rectangles[indexPartition];

        let resultX = rect.x+ Math.floor(Math.random()*this.rectangleWidth);
        let resultY = rect.y+ Math.floor(Math.random()*this.rectangleHeight);

        return new YPoint(resultX,resultY);
    }

    generateIndividual(){
        let resultIndividual = [];
        let resultPartition = this.createRandomizedPartition();

        for( let i=0; i < this.nodeArr.length; i++){
            resultIndividual[i] = this.generatePosition(resultPartition[i]);
        }
        return [resultIndividual,resultPartition];
    }

    applyIndividual( individual: YPoint[]){
        for( let i=0; i < individual.length; i++){
            let currentPoint = individual[i];
            let currentVertex: INode = this.nodeArr[i];
            //console.log(currentPoint,currentVertex.tag);
            this.graphComponent.graph.setNodeCenter(currentVertex,currentPoint.toPoint());//new Point(currentPoint.x,currentPoint.y));
        }
    }
}