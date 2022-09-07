import numpy as np
import musicbrainzngs


class Node:
    def __init__(self, id, label, name):
        self.id = id
        self.label = label
        self.name = name
        self.component = -1
        self.degree = 0


nodes = []
nodesMax = -1
nodesWithISNIAndName = []

f = open("app/graph/csv/K-pop_node.csv", "r", encoding="utf8")
for node in f:
    values = node.replace("\n", "").split(",", 2)
    if values[0] == "id":
        continue
    nodeObj = Node(int(values[0]), values[1], values[2])
    nodes.append(nodeObj)

    if int(values[0]) > nodesMax:
        nodesMax = int(values[0])

f.close()

musicbrainzngs.set_useragent("kpop_research_group", "0.1", contact=None)
musicbrainzngs.set_rate_limit(limit_or_interval=1.0, new_requests=1)

for node in nodes:    
    if node.label != "group":
        continue
    result = musicbrainzngs.search_artists(artist="" + node.name, type="group",
                                        country="KR", limit=5, strict=False)

    foundArtists = []
    for artist in result['artist-list']:
        if artist['name'].upper() == node.name.upper():
            if ("country" in artist and artist['country']=="KR") or ("disambiguation" in artist and artist['disambiguation'] == "Korean"):
                foundArtists = [artist]
                break
        if artist['name'] not in ["The Beatles", "The Rolling Stones", "Pearl Jam", "U2", "The E Street Band"]:
            foundArtists.append(artist)
        
    for artist in foundArtists:
        if "isni-list" in artist:
            isniNumber = artist["isni-list"]
        else:
            isniNumber = ""
        if "country" in artist:
            country = artist["country"]
        elif "disambiguation" in artist:
            country = artist["disambiguation"]
        else:
            country = ""
        insinode = [node.id, node.label, node.name, isniNumber, artist['name'], country, artist['id']]
        print(insinode)
        nodesWithISNIAndName.append(insinode)


with open('app/graph/csv/K-pop_node_isni.csv', 'w', encoding="utf8") as insi_file:
    insi_file.write('id,type,name,isni,mbname,country,mbid\n')
    for insinode in nodesWithISNIAndName:
        insi_file.write(u"{id},{type},{name},{isni},{mbname},{country},{mbid}\n".format(id=insinode[0], type=insinode[1], name=insinode[2], isni=insinode[3], mbname=insinode[4], country=insinode[5], mbid=insinode[6]))
