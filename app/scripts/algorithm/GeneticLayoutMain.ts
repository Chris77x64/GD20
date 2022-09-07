import {
    EdgeBundlingStage,
    GraphComponent, INode, YPoint
} from 'yfiles'

import {Centrality} from "./Centrality";
import {SweepLine} from "./SweepLine";
import {GraphController} from "../controller/GraphController";
import {SimplyConnectedGraph} from "../model/subgraph/SimplyConnectedGraph";
import Papa from "papaparse";

export class GeneticLayoutMain {

    graphComponent: GraphComponent
    centralityMeasurement: Centrality
    sweepLine: SweepLine

    population: number
    iterations: number
    mutations: number
    mutationDecay: number
    selectionPressure: number
    maximumRadius : number;

    center: YPoint
    nodeArr: INode[]


    constructor(graphComponent: GraphComponent, graphController: GraphController ) {

        this.initialize(graphComponent,graphController);

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

    initialize(graphComponent: GraphComponent, graphController: GraphController ){
        graphController.currentGraph = new SimplyConnectedGraph(graphComponent,graphController.kGraph);
        this.graphComponent = graphComponent;
        this.nodeArr = graphComponent.graph.nodes.toArray();
        this.centralityMeasurement = new Centrality(graphComponent);
        this.sweepLine = new SweepLine();
        this.initializeParameter();
    }


    update(graphController: GraphController){
        this.graphComponent.setContentRect(0,0,5000,5000);
        this.graphComponent.fitContent();
        graphController.graphStyle.update(graphController.kGraph);
    }


    initializeParameter(){
        this.maximumRadius = 2500;
        this.center = new YPoint(2500,2500);

        this.mutations = 0.001//0.45;
        this.mutationDecay = 0.02;

        this.population = 20; //30;
        this.iterations = 1;//15000;//950; //1500;

        this.selectionPressure = 740;//1000;
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
        let i0 = this.customParse("http://localhost:9003/csv/geneticMain/l"+0+".csv",individual0);
        let individual1 = [];
        let i1 = this.customParse("http://localhost:9003/csv/geneticMain/l"+1+".csv",individual1);
        let individual2 = [];
        let i2 = this.customParse("http://localhost:9003/csv/geneticMain/l"+2+".csv",individual2);
        let individual3 = [];
        let i3 = this.customParse("http://localhost:9003/csv/geneticMain/l"+3+".csv",individual3);
        let individual4 = [];
        let i4 = this.customParse("http://localhost:9003/csv/geneticMain/l"+4+".csv",individual4);
        let individual5 = [];
        let i5 = this.customParse("http://localhost:9003/csv/geneticMain/l"+5+".csv",individual5);
        let individual6 = [];
        let i6 = this.customParse("http://localhost:9003/csv/geneticMain/l"+6+".csv",individual6);
        let individual7 = [];
        let i7 = this.customParse("http://localhost:9003/csv/geneticMain/l"+7+".csv",individual7);
        let individual8 = [];
        let i8 = this.customParse("http://localhost:9003/csv/geneticMain/l"+8+".csv",individual8);
        let individual9 = [];
        let i9 = this.customParse("http://localhost:9003/csv/geneticMain/l"+9+".csv",individual9);
        let individual10 = [];
        let i10 = this.customParse("http://localhost:9003/csv/geneticMain/l"+10+".csv",individual10);
        let individual11 = [];
        let i11 = this.customParse("http://localhost:9003/csv/geneticMain/l"+11+".csv",individual11);
        let individual12 = [];
        let i12 = this.customParse("http://localhost:9003/csv/geneticMain/l"+12+".csv",individual12);
        let individual13 = [];
        let i13 = this.customParse("http://localhost:9003/csv/geneticMain/l"+13+".csv",individual13);
        let individual14 = [];
        let i14 = this.customParse("http://localhost:9003/csv/geneticMain/l"+14+".csv",individual14);
        let individual15 = [];
        let i15 = this.customParse("http://localhost:9003/csv/geneticMain/l"+15+".csv",individual15);
        let individual16 = [];
        let i16 = this.customParse("http://localhost:9003/csv/geneticMain/l"+16+".csv",individual16);
        let individual17 = [];
        let i17 = this.customParse("http://localhost:9003/csv/geneticMain/l"+17+".csv",individual17);
        let individual18 = [];
        let i18 = this.customParse("http://localhost:9003/csv/geneticMain/l"+18+".csv",individual18);
        let individual19 = [];
        let i19 = this.customParse("http://localhost:9003/csv/geneticMain/l"+19+".csv",individual19);

        Promise.all([i0,i1,i2,i3,i4,i5,i6,i7,i8,i9,i10,i11,i12,i13,i14,i15,i16,i17,i18,i19]).then(()=>{
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
            population.push(individual15);
            population.push(individual16);
            population.push(individual17);
            population.push(individual18);
            population.push(individual19);

            this.geneticAsynchronous(population);
            this.bundling();
        })


    }

    bundling(){

        let stage = new EdgeBundlingStage();
        stage.edgeBundling.bundlingQuality = 0.99//0.8//0.999;
        stage.edgeBundling.bundlingStrength = 0.99//0.99//0.999;

        this.graphComponent.graph.applyLayout(stage);

    }

    geneticAsynchronous(initialPopulation){

        let population = initialPopulation;
        let currentFitness = this.calculatePopulationFitness(population);

        let initialSort = this.sortByFitness(population,currentFitness);

        population = initialSort[0];
        currentFitness = initialSort[1];

        for( let iteration = 0; iteration < this.iterations; iteration++){

            let wheelProbabilities = this.rouletteWheel(currentFitness);
            let wheelCDF = this.calculateCDF(wheelProbabilities);

            console.log(currentFitness);
            console.log(wheelProbabilities);
            console.log('MUTATION RATE: ',this.mutations);

            let result = this.selection(population,wheelCDF,currentFitness);

            population = result[0];
            currentFitness = result[1];

            if( this.mutations > 0.00001) {

                this.mutations = (1 - this.mutationDecay) * this.mutations;
            }
            else{
                this.mutations = 0.001;
            }
        }

        this.applyResult(population,currentFitness);
        this.exportLayoutCSV(population);
    }

    genetic(){

        let count = 0;
        let population = this.generatePopulation();
        let currentFitness = this.calculatePopulationFitness(population);

        let initialSort = this.sortByFitness(population,currentFitness);

        population = initialSort[0];
        currentFitness = initialSort[1];

        for( let iteration = 0; iteration < this.iterations; iteration++){

            let wheelProbabilities = this.rouletteWheel(currentFitness);
            let wheelCDF = this.calculateCDF(wheelProbabilities);

            console.log(currentFitness);
            console.log(wheelProbabilities);
            console.log('MUTATION RATE: ',this.mutations);

            let result = this.selection(population,wheelCDF,currentFitness);

            population = result[0];
            currentFitness = result[1];

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

        this.applyResult(population,currentFitness);
        this.exportLayoutCSV(population);
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

    download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    sortByFitness(population,fitness){

        let arr = []

        for(let i=0; i < population.length; i++){
            arr.push([i,fitness[i]]);
        }

        arr.sort(function(first, second){
            return first[1]-second[1];
        });


        let sortedPopulation = [];
        let sortedFitness = [];

        for(let i=0; i < population.length; i++){
            let populationIndex = (arr[i])[0];
            sortedPopulation[i] =  population[populationIndex];
            sortedFitness[i]    =  (arr[i])[1];
        }

        return [sortedPopulation,sortedFitness];
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

    calculateMinimum(input: number[]): number {
        let indexMin = this.calculateArgMin(input);
        return input[indexMin];
    }


    exponentialMapping( fitness): number[] {
        let maxFitness = this.calculateMaximum(fitness);
        let result = [];
        for( let i=0; i < fitness.length; i++){
            let temp = (fitness[i]/maxFitness);
            let exponent: number = - temp * this.selectionPressure ;
            result[i] = Math.exp(exponent);
        }
        return result;
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

    calculatePopulationFitness(population){
        let result = [];

        for( let i=0; i < population.length; i++){
            let currentIndividual = population[i];
            result[i] = this.fitness(currentIndividual);
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

    selectIndividual( population,wheelCDF ){
        let random = Math.random();

        if( random < wheelCDF[0]){
            return population[0];
        }
        else {
            for (let i = 1; i < wheelCDF.length; i++) {
                let previousVal = wheelCDF[i-1];
                let currentVal = wheelCDF[i];

                if( (random >= previousVal) && (random < currentVal)){
                    return population[i];
                }
            }
        }
    }

    intervalCrossover(first, second,start,end){
        let result = [];
        for( let i=0; i < start; i++){
            result[i] = first[i];
        }
        for( let i=start; i < end; i++){
            result[i] = second[i];
        }
        for( let i=end; i < first.length; i++){
            result[i] = first[i];
        }
        return result;

    }

    crossover( first, second){
        let result = [];
        let middle = Math.floor(first.length/2);
        for( let i=0; i < first.length; i++){
            if( i < middle){
                result[i] = first[i];
            }
            else{
                result[i] = second[i];
            }
        }
        return result;
    }

    intervalOffspring(population,wheelCDF){
        let first = this.selectIndividual( population,wheelCDF );
        let second = this.selectIndividual( population,wheelCDF );

        let halfSize = Math.ceil(first.length/2);

        let randomStart= Math.floor(Math.random()*halfSize);
        let randomEnd = Math.floor(randomStart+halfSize);

        return this.intervalCrossover(first,second,randomStart,randomEnd);

    }

    offspring( population,wheelCDF){

        let first = this.selectIndividual( population,wheelCDF );
        let second = this.selectIndividual( population,wheelCDF );

        let random = Math.random();
        if( random <= 0.5 ){
            return this.crossover(first,second);
        }
        else{
            return this.crossover(second,first);
        }
    }

    selection( population,wheelCDF,fitnessPopulation){

        let result = [];
        let resultFitness = [];

        let newPopulation = [];
        let newFitness = [];

        for (let i = 0; i < population.length; i++) {

            let newIndividual = this.intervalOffspring(population,wheelCDF); //this.offspring(population,wheelCDF);
            let mutatedIndividual = this.mutation(newIndividual);

            newFitness[i] = this.fitness(mutatedIndividual);
            newPopulation[i] = mutatedIndividual;
        }

        let sorted = this.sortByFitness(newPopulation,newFitness);
        newPopulation = sorted[0];
        newFitness = sorted[1];

        let indexA = 0;
        let indexB = 0;

        for (let i = 0; i < population.length; i++) {

            if( fitnessPopulation[indexA] <= newFitness[indexB] ){
                result[i] = population[indexA];
                resultFitness[i] = fitnessPopulation[indexA];
                indexA = indexA +1;
            }
            else{
                result[i] = newPopulation[indexB];
                resultFitness[i] = newFitness[indexB];
                indexB = indexB +1;
            }
        }

        return [result,resultFitness];
    }

    mutation( currentIndividual){

        let newIndividual = [];

        for( let k = 0; k < currentIndividual.length ; k++){

            let random = Math.random();

            if ( random <= this.mutations){
                newIndividual[k] = this.generatePosition(k);
            }
            else{
                newIndividual[k] = currentIndividual[k];
            }
        }

        return newIndividual;
    }

    fitness( individual: YPoint[] ): number{

        this.applyIndividual(individual);
        return this.sweepLine.calculateCrossings(this.graphComponent.graph);
    }

    applyIndividual( individual: YPoint[]){

        let nodes = this.graphComponent.graph.nodes;
        for( let i=0; i < individual.length; i++){
            let currentPoint: YPoint = individual[i];
            let currentVertex: INode = nodes.get(i);
            this.graphComponent.graph.setNodeCenter(currentVertex,currentPoint.toPoint());
        }
    }

    generatePopulation(){
        let result = [];
        for( let i=0; i < this.population; i++){
            result[i] = this.generateIndividual();
        }
        return result;
    }


    generatePosition(indexVertex:number): YPoint{
        let currentNode: INode = this.graphComponent.graph.nodes.get(indexVertex);
        let index = this.centralityMeasurement.heightMap.get(currentNode);

        switch (index) {
            case index = 1:{
                return this.generatePointInCircleRadius(1200);
            }
            case index = 2:{
                return  this.generatePointBetweenCircles(1300,2000);
            }
            case index = 3:{
                return this.generatePointBetweenCircles(2000,2200);
            }
            case index = 4:{
                return this.generatePointBetweenCircles(2200,2300);
            }
            case index = 5:{
                return this.generatePointBetweenCircles(2300,2350);
            }
            case index = 6:{
                return this.generatePointBetweenCircles(2350,2400);
            }
            case index = 7:{
                return this.generatePointBetweenCircles(2400,2450);
            }
            case index = 8:{
                return this.generatePointBetweenCircles(2450,2500);
            }
            case index = 9:{
                return this.generatePointBetweenCircles(2500,2550);
            }
            default:{
                return this.generatePointBetweenCircles(2250,2600);
            }
        }
    }

    generateIndividual(): YPoint[]{
        let result = [];
        let nodes = this.graphComponent.graph.nodes;

        for( let i=0; i < nodes.size; i++){
            result[i] = this.generatePosition(i);
        }
        return result;
    }

    generatePointBetweenCircles( minRadius: number,maxRadius:number){
        let randomAngle = 2 * Math.PI * Math.random();

        let diff = minRadius/maxRadius;
        let remainder = 1-diff;

        let additionalPart = Math.random() * remainder;

        let randomScaling = maxRadius * (diff+additionalPart);

        let randomPoint = new YPoint(
            randomScaling*Math.cos(randomAngle),
            randomScaling*Math.sin(randomAngle));
        return YPoint.add(this.center,randomPoint);
    }

    generatePointInCircleRadius(maxRadius:number){

        let randomScaling = maxRadius* Math.sqrt(Math.random());
        let randomAngle = 2 * Math.PI * Math.random();

        let randomPoint = new YPoint(
            randomScaling*Math.cos(randomAngle),
            randomScaling*Math.sin(randomAngle));
        return YPoint.add(this.center,randomPoint);
    }


}