import numpy as np


class Node:
    def __init__(self, id, label, name):
        self.id = id
        self.label = label
        self.name = name
        self.component = -1
        self.degree = 0


nodes = []
nodesMax = -1

f = open("K-pop_node.csv", "r")
for node in f:
    values = node.replace("\n", "").split(",", 2)
    nodeObj = Node(int(values[0]), values[1], values[2])
    nodes.append(nodeObj)

    if int(values[0]) > nodesMax:
        nodesMax = int(values[0])

f.close()

edgeMatrix = np.zeros((nodesMax + 1, nodesMax + 1))

f = open("K-pop_edge.csv", "r")
for edge in f:
    values = edge.split(",")
    a = int(values[0])
    b = int(values[1])
    edgeMatrix[a, b] = 1

f.close()

component_id = 0
component_sizes = []


def get_node(i):
    for n in nodes:
        if n.id == i:
            return n


def check_component(n):
    if n.component != -1:
        return

    n.component = component_id
    component_sizes[len(component_sizes) - 1] += 1

    for i in range(0, nodesMax):
        if edgeMatrix[n.id, i] == 1 or edgeMatrix[i, n.id] == 1:
            check_component(get_node(i))


for n in nodes:
    if n.component == -1:
        component_sizes.append(0)
        check_component(n)
        component_id += 1

main_component_id = np.argmax(component_sizes)

with open('K-pop_edge_main.csv', 'w') as edge_file:
    edge_file.write('source,target\n')

    for i in range(0, nodesMax + 1):
        for j in range(0, nodesMax + 1):
            if edgeMatrix[i, j] == 1:
                a = get_node(i)
                b = get_node(j)
                a.degree += 1
                b.degree += 1

                if a.component == main_component_id and b.component == main_component_id:
                    edge_file.write(str(a.id) + "," + str(b.id) + "\n")

with open('K-pop_node_main.csv', 'w') as node_file:
    node_file.write('id,type,name,degree\n')

    for i in range(0, len(nodes)):
        if nodes[i].component == main_component_id:
            node_file.write(str(nodes[i].id) + "," + nodes[i].label + "," + nodes[i].name + "," + str(nodes[i].degree) + "\n")
