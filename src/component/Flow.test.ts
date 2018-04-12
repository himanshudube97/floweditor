import { object } from 'prop-types';
import { v4 as generateUUID } from 'uuid';
import * as config from '../../assets/config';
import {
    dragSelectSpecId,
    Flow,
    FlowStoreProps,
    getDragStyle,
    getGhostUI,
    GHOST_POSITION_INITIAL,
    ghostNodeSpecId,
    isDraggingBack,
    nodesContainerSpecId,
    nodeSpecId,
    REPAINT_TIMEOUT
} from '../component/Flow';
import { endpointsPT, languagesPT } from '../config';
import { getActivity } from '../external';
import { FlowDefinition } from '../flowTypes';
import ActivityManager from '../services/ActivityManager';
import Plumber from '../services/Plumber';
import { ConnectionEvent, createStore, initialState } from '../store';
import { getCollisions, getGhostNode, getRenderNodeMap } from '../store/helpers';
import { createSetup, createSpy, getSpecWrapper } from '../testUtils';
import { getBaseLanguage } from '../utils';

jest.mock('../services/ActivityManager');
jest.mock('../services/Plumber');
jest.useFakeTimers();

const definition = require('../../__test__/customer_service.json') as FlowDefinition;

const { languages, endpoints } = config;

const language = getBaseLanguage(languages);

const context = {
    languages,
    endpoints,
    store: createStore({
        ...initialState,
        flowContext: { ...initialState.flowContext, definition },
        flowEditor: {
            ...initialState.flowEditor,
            editorUI: { ...initialState.flowEditor.editorUI, language, translating: false }
        }
    })
};

const childContextTypes = {
    store: object,
    endpoints: endpointsPT,
    languages: languagesPT
};

const baseProps: FlowStoreProps = {
    translating: false,
    definition,
    nodes: getRenderNodeMap(definition),
    dependencies: [],
    ghostNode: null,
    pendingConnection: null,
    dragSelection: null,
    nodeEditorOpen: false,
    ensureStartNode: jest.fn(),
    updateConnection: jest.fn(),
    onOpenNodeEditor: jest.fn(),
    resetNodeEditingState: jest.fn(),
    onConnectionDrag: jest.fn(),
    updateCreateNodePosition: jest.fn(),
    updateDragSelection: jest.fn()
};

const setup = createSetup<FlowStoreProps>(Flow, baseProps, context, childContextTypes);

const spyOnFlow = createSpy(Flow);

describe(Flow.name, () => {
    beforeEach(() => {
        // Clear instances, calls to constructor, methods:
        ActivityManager.mockClear();
        Plumber.mockClear();

        jest.clearAllTimers();
    });

    const { nodes: renderNodeMap } = baseProps;
    const renderNodeMapKeys = Object.keys(baseProps.nodes);
    const ghostNodeFromWait = getGhostNode(
        renderNodeMap[renderNodeMapKeys[renderNodeMapKeys.length - 1]],
        renderNodeMap
    );
    const ghostNodeFromAction = getGhostNode(renderNodeMap[renderNodeMapKeys[0]], renderNodeMap);

    const mockConnectionEvent: Partial<ConnectionEvent> = {
        sourceId: `${generateUUID()}:${generateUUID()}`,
        targetId: generateUUID(),
        suspendedElementId: generateUUID(),
        source: null
    };

    const dragSelection = {
        startX: 270,
        startY: 91,
        currentX: 500,
        currentY: 302,
        selected: {
            '46e8d603-8e5d-4435-97dd-1333291aafca': true,
            'bc978e00-2f3d-41f2-87c1-26b3f14e5925': true
        }
    };

    describe('helpers', () => {
        describe('isDraggingBack', () => {
            it('should return false if event indicates user is not returning to drag origin', () => {
                expect(isDraggingBack(mockConnectionEvent as ConnectionEvent)).toBeFalsy();
            });

            it('should return true if event indicates user is returning to drag origin', () => {
                const suspendedElementId = generateUUID();

                expect(
                    isDraggingBack({
                        ...mockConnectionEvent,
                        source: document.createElement('div'),
                        suspendedElementId,
                        targetId: suspendedElementId
                    } as ConnectionEvent)
                ).toBeTruthy();
            });
        });

        describe('getGhostUI', () => {
            it('should return only the position of the ghost node if it does not have a router', () => {
                const ghostUI = getGhostUI(ghostNodeFromWait);

                expect(ghostUI).toEqual({
                    position: GHOST_POSITION_INITIAL
                });
                expect(ghostUI).toMatchSnapshot();
            });

            it('should return the position and type of the ghost node if it has a router', () => {
                const ghostUI = getGhostUI(ghostNodeFromAction);

                expect(ghostUI).toEqual({
                    position: GHOST_POSITION_INITIAL,
                    type: 'wait_for_response'
                });
                expect(ghostUI).toMatchSnapshot();
            });
        });

        describe('getDragStyle', () => {
            it('should return style object for drag selection box', () => {
                expect(getDragStyle(dragSelection)).toMatchSnapshot();
            });
        });
    });

    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, instance, props } = setup({}, true);
            const nodes = getSpecWrapper(wrapper, nodeSpecId);
            const nodeContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

            expect(nodeContainer.hasClass('nodeList')).toBeTruthy();
            expect(nodeContainer.props()).toEqual(
                expect.objectContaining({
                    onMouseDown: instance.onMouseDown,
                    onMouseMove: instance.onMouseMove,
                    onMouseUp: instance.onMouseUp
                })
            );
            expect(nodes.length).toBe(props.definition.nodes.length);
            nodes.forEach((node, idx) => {
                const renderMapKeys = Object.keys(props.nodes);
                const nodeUUID = renderMapKeys[idx];
                const renderNode = props.nodes[nodeUUID];
                expect(node.key()).toBe(nodeUUID);
                expect(node.props()).toEqual(
                    expect.objectContaining({
                        node: renderNode.node,
                        ui: renderNode.ui,
                        Activity: instance.Activity,
                        plumberRepaintForDuration: instance.Plumber.repaintForDuration,
                        plumberDraggable: instance.Plumber.draggable,
                        plumberMakeTarget: instance.Plumber.makeTarget,
                        plumberRemove: instance.Plumber.remove,
                        plumberRecalculate: instance.Plumber.recalculate,
                        plumberMakeSource: instance.Plumber.makeSource,
                        plumberConnectExit: instance.Plumber.connectExit,
                        plumberSetDragSelection: instance.Plumber.setDragSelection,
                        plumberClearDragSelection: instance.Plumber.clearDragSelection,
                        plumberRemoveFromDragSelection: instance.Plumber.removeFromDragSelection
                    })
                );
            });
            expect(wrapper).toMatchSnapshot();
        });

        it('should render NodeEditor', () => {
            const { wrapper, instance } = setup({ nodeEditorOpen: true }, true);

            expect(wrapper.find('Connect(NodeEditor)').props()).toEqual({
                plumberConnectExit: instance.Plumber.connectExit,
                plumberRepaintForDuration: instance.Plumber.repaintForDuration
            });
            expect(wrapper).toMatchSnapshot();
        });

        it('should render Simulator', () => {
            const { wrapper, instance, props } = setup({}, true, {
                endpoints: { ...config.endpoints, engine: 'someEngine' }
            });

            expect(wrapper.find('Simulator').props()).toEqual({
                definition: props.definition,
                showDefinition: instance.onShowDefinition,
                Activity: instance.Activity
            });
            expect(wrapper).toMatchSnapshot();
        });

        it('should render dragNode', () => {
            const { wrapper, instance, props } = setup({ ghostNode: ghostNodeFromWait }, true);
            const ghost = getSpecWrapper(wrapper, ghostNodeSpecId);

            expect(ghost.key()).toBe(props.ghostNode.uuid);
            expect(ghost.props()).toEqual(
                expect.objectContaining({
                    ghost: true,
                    node: props.ghostNode,
                    ui: getGhostUI(props.ghostNode),
                    Activity: instance.Activity,
                    plumberRepaintForDuration: instance.Plumber.repaintForDuration,
                    plumberDraggable: instance.Plumber.draggable,
                    plumberMakeTarget: instance.Plumber.makeTarget,
                    plumberRemove: instance.Plumber.remove,
                    plumberRecalculate: instance.Plumber.recalculate,
                    plumberMakeSource: instance.Plumber.makeSource,
                    plumberConnectExit: instance.Plumber.connectExit,
                    plumberSetDragSelection: instance.Plumber.setDragSelection,
                    plumberClearDragSelection: instance.Plumber.clearDragSelection,
                    plumberRemoveFromDragSelection: instance.Plumber.removeFromDragSelection
                })
            );
        });

        it('should render drag selection box', () => {
            const { wrapper, props } = setup({ dragSelection }, true);
            const drag = getSpecWrapper(wrapper, dragSelectSpecId);

            expect(drag.hasClass('dragSelection')).toBeTruthy();
            expect(drag.prop('style')).toEqual(getDragStyle(props.dragSelection));
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('constructor', () => {
            const { wrapper, props } = setup({}, true);

            // Instanstiate ActivityManager, Plumber
            expect(ActivityManager).toHaveBeenCalledTimes(1);
            expect(ActivityManager).toHaveBeenCalledWith(props.definition.uuid, getActivity);
            expect(Plumber).toHaveBeenCalledTimes(1);
        });

        describe('componentDidMount', () => {
            const componentDidMountSpy = spyOnFlow('componentDidMount');
            const { wrapper, instance, props } = setup({ ensureStartNode: jest.fn() }, true);

            jest.runAllTimers();

            expect(componentDidMountSpy).toHaveBeenCalledTimes(1);

            expect(instance.Plumber.bind).toHaveBeenCalledTimes(7);
            expect(instance.Plumber.bind).toHaveBeenCalledWith('connection', expect.any(Function));
            expect(instance.Plumber.bind).toHaveBeenCalledWith('connection', expect.any(Function));
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'connectionDrag',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'connectionDragStop',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'beforeStartDetach',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'beforeDetach',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith('beforeDrop', expect.any(Function));

            expect(props.ensureStartNode).toHaveBeenCalledTimes(1);

            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), REPAINT_TIMEOUT);
            expect(instance.Plumber.repaint).toHaveBeenCalledTimes(1);

            componentDidMountSpy.mockRestore();
        });

        describe('componenWillUnmount', () => {
            const componentWillUnmountSpy = spyOnFlow('componentWillUnmount');
            const { wrapper, instance } = setup({}, true);

            wrapper.unmount();

            expect(componentWillUnmountSpy).toHaveBeenCalledTimes(1);
            expect(instance.Plumber.reset).toHaveBeenCalledTimes(1);

            componentWillUnmountSpy.mockRestore();
        });

        describe('onBeforeConnectorDrop', () => {
            it('should call resetNodeEditingState prop', () => {
                const { wrapper, instance, props } = setup(
                    { resetNodeEditingState: jest.fn() },
                    true
                );

                instance.onBeforeConnectorDrop(mockConnectionEvent);

                expect(props.resetNodeEditingState).toHaveBeenCalledTimes(1);
            });

            it('should return false if pointing to itself', () => {
                const { wrapper, instance } = setup({}, true);
                const sourceId = generateUUID();

                expect(
                    instance.onBeforeConnectorDrop({
                        ...mockConnectionEvent,
                        sourceId: `${sourceId}:${generateUUID()}`,
                        targetId: sourceId
                    })
                ).toBeFalsy();
            });

            it('should return true if not pointing to itself', () => {
                const { wrapper, instance } = setup({}, true);

                expect(instance.onBeforeConnectorDrop(mockConnectionEvent)).toBeTruthy();
            });
        });

        describe('onConnectorDrop', () => {
            it('should not do NodeEditor work if the user is dragging back', () => {
                const { wrapper, instance, props } = setup(
                    {
                        updateCreateNodePosition: jest.fn(),
                        onOpenNodeEditor: jest.fn()
                    },
                    true
                );

                jest.runAllTimers();

                instance.onConnectorDrop(mockConnectionEvent);

                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
                expect(instance.Plumber.recalculate).not.toHaveBeenCalled();
                expect(instance.Plumber.connect).not.toHaveBeenCalled();
                expect(props.updateCreateNodePosition).not.toHaveBeenCalled();
                expect(props.onOpenNodeEditor).not.toHaveBeenCalled();
            });

            it('should do NodeEditor work if the user is not dragging back', () => {
                const pendingConnection = {
                    exitUUID: generateUUID(),
                    nodeUUID: generateUUID()
                };
                const suspendedElementId = generateUUID();
                const ghostRefSpy = spyOnFlow('ghostRef');
                // tslint:disable-next-line:no-shadowed-variable
                const { wrapper, instance, props, context } = setup({
                    updateCreateNodePosition: jest.fn(),
                    onOpenNodeEditor: jest.fn(),
                    ghostNode: ghostNodeFromWait,
                    pendingConnection
                });

                instance.onConnectorDrop({
                    ...mockConnectionEvent,
                    source: document.createElement('div')
                });

                jest.runAllTimers();

                expect(ghostRefSpy).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
                expect(instance.Plumber.recalculate).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.recalculate).toHaveBeenCalledWith(props.ghostNode.uuid);
                expect(instance.Plumber.connect).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.connect).toHaveBeenCalledWith(
                    `${props.pendingConnection.nodeUUID}:${props.pendingConnection.exitUUID}`,
                    props.ghostNode.uuid
                );
                expect(props.updateCreateNodePosition).toHaveBeenCalledTimes(1);
                expect(props.onOpenNodeEditor).toHaveBeenCalledTimes(1);
                expect(props.onOpenNodeEditor).toHaveBeenCalledWith(
                    props.ghostNode,
                    null,
                    context.languages
                );
            });
        });

        describe('beforeConnectionDrag', () => {
            it('should return reversse of translating prop', () => {
                const { wrapper, instance, props } = setup({}, true);

                expect(instance.beforeConnectionDrag(mockConnectionEvent)).toBe(!props.translating);
            });
        });

        describe('onMouseDown', () => {
            it("should update instance's containerOffset property, call updateDragSelection prop", () => {
                const mockMouseDownEvent = {
                    nativeEvent: {
                        offsetX: 119,
                        offsetY: 237
                    },
                    pageX: 138,
                    pageY: 307
                };
                const { wrapper, instance, props } = setup(
                    { updateDragSelection: jest.fn() },
                    true
                );
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseDown', mockMouseDownEvent);

                expect(instance.containerOffset).toEqual({
                    x: mockMouseDownEvent.nativeEvent.offsetX - mockMouseDownEvent.pageX,
                    y: mockMouseDownEvent.nativeEvent.offsetY - mockMouseDownEvent.pageY
                });
                expect(props.updateDragSelection).toHaveBeenCalledTimes(1);
                expect(props.updateDragSelection).toHaveBeenCalledWith({
                    startX: mockMouseDownEvent.pageX + instance.containerOffset.x,
                    startY: mockMouseDownEvent.pageY + instance.containerOffset.y,
                    currentX: mockMouseDownEvent.pageX + instance.containerOffset.x,
                    currentY: mockMouseDownEvent.pageY + instance.containerOffset.y
                });
            });
        });

        describe('onMouseMove', () => {
            it('should call updateDragSelection prop if user is creating a drag selection', () => {
                const mockMouseMoveEvent = {
                    pageX: 519,
                    pageY: 372
                };
                const { wrapper, instance, props } = setup(
                    {
                        updateDragSelection: jest.fn(),
                        dragSelection
                    },
                    true
                );
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                instance.containerOffset = {
                    x: -20,
                    y: -70
                };

                nodesContainer.simulate('mouseMove', mockMouseMoveEvent);

                expect(props.updateDragSelection).toHaveBeenCalledTimes(1);
                expect(props.updateDragSelection).toHaveBeenCalledWith({
                    startX: props.dragSelection.startX,
                    startY: props.dragSelection.startY,
                    currentX: mockMouseMoveEvent.pageX + instance.containerOffset.x,
                    currentY: mockMouseMoveEvent.pageY + instance.containerOffset.y,
                    selected: getCollisions(props.nodes, {
                        left: Math.min(props.dragSelection.startX, props.dragSelection.currentX),
                        top: Math.min(dragSelection.startY, dragSelection.currentY),
                        right: Math.min(dragSelection.startX, dragSelection.currentX),
                        bottom: Math.min(dragSelection.startY, dragSelection.currentY)
                    })
                });
            });

            it('should not call updateDragSelection prop if user is not creating a drag selection', () => {
                const { wrapper, props } = setup({ updateDragSelection: jest.fn() }, true);
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseMove');

                expect(props.updateDragSelection).not.toHaveBeenCalled();
            });
        });

        describe('onMouseUp', () => {
            it('should call updateDragSelection if user is creating a drag selection', () => {
                const { wrapper, instance, props } = setup(
                    { updateDragSelection: jest.fn(), dragSelection },
                    true
                );
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(props.updateDragSelection).toHaveBeenCalledTimes(1);
                expect(props.updateDragSelection).toHaveBeenCalledWith({
                    startX: null,
                    startY: null,
                    currentX: null,
                    currentY: null,
                    selected: props.dragSelection.selected
                });
            });

            it('notify jsplumb of the drag selection if nodes selected', () => {
                const { wrapper, instance, props } = setup(
                    { updateDragSelection: jest.fn(), dragSelection },
                    true
                );
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(instance.Plumber.setDragSelection).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.setDragSelection).toHaveBeenCalledWith(
                    props.dragSelection.selected
                );
            });

            it('should not call updateDragSelection, notify jsplumb of selection if no selection exists', () => {
                const { wrapper, instance, props } = setup(
                    { updateDragSelection: jest.fn() },
                    true
                );
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(props.updateDragSelection).not.toHaveBeenCalled();
                expect(instance.Plumber.setDragSelection).not.toHaveBeenCalled();
            });
        });
    });
});
