// tslint:disable:no-shadowed-variable
import { combineReducers } from 'redux';

import { FlowDefinition, FlowNode, UINode } from '../flowTypes';
import { Asset } from '../services/AssetService';
import { LocalizedObject } from '../services/Localization';
import ActionTypes, {
    IncrementSuggestedResultNameCountAction,
    UpdateBaseLanguageAction,
    UpdateDefinitionAction,
    UpdateDependenciesAction,
    UpdateLanguagesAction,
    UpdateLocalizationsAction,
    UpdateNodesAction,
    UpdateResultNamesAction,
} from './actionTypes';
import Constants from './constants';

export interface RenderNodeMap {
    [uuid: string]: RenderNode;
}

export interface RenderNode {
    ui: UINode;
    node: FlowNode;
    inboundConnections: { [uuid: string]: string };
}

export interface CompletionOption {
    name: string;
    description: string;
}

export interface ResultNames {
    [nodeUUID: string]: CompletionOption;
}

export interface FlowContext {
    dependencies: FlowDefinition[];
    localizations: LocalizedObject[];
    baseLanguage: Asset;
    languages: Asset[];
    resultNames: ResultNames;
    suggestedResultNameCount: number;
    definition: FlowDefinition;
    nodes: { [uuid: string]: RenderNode };
}

// Initial state
export const initialState: FlowContext = {
    definition: null,
    dependencies: null,
    baseLanguage: null,
    languages: [],
    localizations: [],
    resultNames: {},
    suggestedResultNameCount: 1,
    nodes: {}
};

// Action Creators
export const updateDefinition = (definition: FlowDefinition): UpdateDefinitionAction => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateNodes = (nodes: { [uuid: string]: RenderNode }): UpdateNodesAction => ({
    type: Constants.UPDATE_NODES,
    payload: {
        nodes
    }
});

export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependenciesAction => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});

export const updateBaseLanguage = (baseLanguage: Asset): UpdateBaseLanguageAction => ({
    type: Constants.UPDATE_BASE_LANGUAGE,
    payload: {
        baseLanguage
    }
});

export const updateLanguages = (languages: Asset[]): UpdateLanguagesAction => ({
    type: Constants.UPDATE_LANGUAGES,
    payload: {
        languages
    }
});

export const updateLocalizations = (
    localizations: LocalizedObject[]
): UpdateLocalizationsAction => ({
    type: Constants.UPDATE_LOCALIZATIONS,
    payload: {
        localizations
    }
});

export const updateResultNames = (resultNames: ResultNames): UpdateResultNamesAction => ({
    type: Constants.UPDATE_RESULT_NAMES,
    payload: {
        resultNames
    }
});

export const incrementSuggestedResultNameCount = (): IncrementSuggestedResultNameCountAction => ({
    type: Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
});

// Reducers
export const definition = (
    state: FlowDefinition = initialState.definition,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_DEFINITION:
            return action.payload.definition;
        default:
            return state;
    }
};

export const nodes = (state: {} = initialState.nodes, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODES:
            return action.payload.nodes;
        default:
            return state;
    }
};

export const dependencies = (
    state: FlowDefinition[] = initialState.dependencies,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_DEPENDENCIES:
            return action.payload.dependencies;
        default:
            return state;
    }
};

export const localizations = (
    state: LocalizedObject[] = initialState.localizations,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_LOCALIZATIONS:
            return action.payload.localizations;
        default:
            return state;
    }
};

export const resultNames = (state: ResultNames = initialState.resultNames, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_NAMES:
            return action.payload.resultNames;
        default:
            return state;
    }
};

export const suggestedResultNameCount = (
    state: number = initialState.suggestedResultNameCount,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT:
            return state + 1;
        default:
            return state;
    }
};

export const baseLanguage = (state: Asset = initialState.baseLanguage, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_BASE_LANGUAGE:
            return action.payload.baseLanguage;
        default:
            return state;
    }
};

export const languages = (state: Asset[] = initialState.languages, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_LANGUAGES:
            return action.payload.languages;
        default:
            return state;
    }
};

// Root reducer
export default combineReducers({
    definition,
    nodes,
    dependencies,
    localizations,
    resultNames,
    suggestedResultNameCount,
    baseLanguage,
    languages
});
