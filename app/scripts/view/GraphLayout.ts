import {
    OrganicLayout
} from 'yfiles'


export enum layoutType {
    Hierarchic,
    Organic,
    Orthogonal,
    Circular,
    Radial
}

export enum layoutTarget {
    allLayout,
    labelsLayout,
    groupsLayout,
    individualsLayout,
    maleLayout,
    femaleLayout,
    othersLayout
}

export function getLayoutTypeString() {
    return ['Hierarchic', 'Organic', 'Orthogonal', 'Circular', 'Radial'];
}

export const allLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor :  0.8,
    minimumNodeDistance : 50
    //preferredEdgeLength : 300
});

export const labelsLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor :  0.9,
    minimumNodeDistance : 200
});

export const groupsLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor :  0.9,
    minimumNodeDistance : 120
});

export const individualsLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor :  0.9,
    minimumNodeDistance : 120
});

export const maleLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor :  0.9,
    minimumNodeDistance : 120
});

export const femaleLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor :  0.9,
    minimumNodeDistance : 120
});

export const othersLayoutOrganic: OrganicLayout = new OrganicLayout({
    compactnessFactor : 0.5,
    minimumNodeDistance : 80,
    preferredEdgeLength : 80
});

export function layoutTypeStringToEnum( inputString: String) {

    switch (inputString) {
        case 'Hierarchic':
            return layoutType.Hierarchic;
        case 'Orthogonal':
            return layoutType.Orthogonal;
        case 'Circular':
            return layoutType.Circular;
        case 'Radial':
            return layoutType.Circular;
        case 'Organic':
            return layoutType.Organic;
    }
}

export function layoutTargetStringToEnum( inputString: String) {

    switch (inputString) {
        case 'Labels':
            return layoutTarget.labelsLayout;
        case 'Groups':
            return layoutTarget.groupsLayout;
        case 'Individuals':
            return layoutTarget.individualsLayout;
        case 'Male':
            return layoutTarget.maleLayout;
        case 'Female':
            return layoutTarget.femaleLayout;
        case 'Other':
            return layoutTarget.othersLayout;
        case 'All':
            return layoutTarget.allLayout;
    }
}
