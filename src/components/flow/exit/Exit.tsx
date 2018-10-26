// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Counter from '~/components/counter/Counter';
import * as styles from '~/components/flow/exit/Exit.scss';
import { Exit, FlowNode, LocalizationMap } from '~/flowTypes';
import ActivityManager from '~/services/ActivityManager';
import { Asset } from '~/store/flowContext';
import AppState from '~/store/state';
import { DisconnectExit, disconnectExit, DispatchWithState } from '~/store/thunks';
import { createClickHandler, getLocalization } from '~/utils';

export interface ExitPassedProps {
    exit: Exit;
    node: FlowNode;
    Activity: ActivityManager;
    plumberMakeSource: Function;
    plumberRemove: Function;
    plumberConnectExit: Function;
    plumberUpdateClass: Function;
}

export interface ExitStoreProps {
    translating: boolean;
    dragging: boolean;
    language: Asset;
    localization: LocalizationMap;
    disconnectExit: DisconnectExit;
}

export type ExitProps = ExitPassedProps & ExitStoreProps;

export interface ExitState {
    confirmDelete: boolean;
}

const cx = classNames.bind(styles);

export class ExitComp extends React.PureComponent<ExitProps, ExitState> {
    private timeout: number;

    constructor(props: ExitProps) {
        super(props);

        this.state = {
            confirmDelete: false
        };

        bindCallbacks(this, {
            include: [/^on/, 'getCount']
        });
    }

    public getSourceId(): string {
        return `${this.props.node.uuid}:${this.props.exit.uuid}`;
    }

    public componentDidMount(): void {
        this.props.plumberMakeSource(this.getSourceId());
        if (this.props.exit.destination_node_uuid) {
            this.connect();
        }
    }

    public componentDidUpdate(prevProps: ExitProps): void {
        if (
            !this.props.exit.destination_node_uuid ||
            this.props.exit.destination_node_uuid !== prevProps.exit.destination_node_uuid
        ) {
            this.connect();
            this.setState({ confirmDelete: false });
        }

        this.props.plumberUpdateClass(
            this.props.node,
            this.props.exit,
            'confirm-delete',
            this.state.confirmDelete
        );

        /*
        console.log(prevProps.exit.destination_node_uuid, this.props.exit.destination_node_uuid);

        if (prevProps.exit.destination_node_uuid && !this.props.exit.destination_node_uuid) {
            if (this.state.confirmDelete) {
                this.setState({ confirmDelete: false });
            }
        } else {
            if (prevProps.exit.destination_node_uuid !== this.props.exit.destination_node_uuid) {
                this.connect();
            } else {
                this.props.plumberUpdateClass(
                    this.props.node,
                    this.props.exit,
                    'confirm-delete',
                    this.state.confirmDelete
                );
            }
        }*/
    }

    public componentWillUnmount(): void {
        if (this.props.exit.destination_node_uuid) {
            this.props.plumberRemove(this.getSourceId());
        }
    }

    private onClick(event: React.MouseEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();

        if (this.props.exit.destination_node_uuid && !this.props.translating) {
            this.setState(
                {
                    confirmDelete: true
                },
                () => {
                    this.timeout = window.setTimeout(() => {
                        this.setState({
                            confirmDelete: false
                        });
                    }, 2000);
                }
            );
        }
    }

    private onDisconnect(event: React.MouseEvent<HTMLDivElement>): void {
        event.stopPropagation();
        event.preventDefault();

        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        this.props.disconnectExit(this.props.node.uuid, this.props.exit.uuid);
    }

    private onUnmount(key: string): void {
        this.props.Activity.deregister(key);
    }

    private connect(): void {
        const classes: string[] = [];

        console.log('Reconnecting', this.props.exit.uuid);

        /* if (this.props.translating) {
            classes.push('translating');
        } else if (this.state.confirmDelete) {
            classes.push('confirm-delete');
        }*/

        this.props.plumberConnectExit(this.props.node, this.props.exit);
    }

    private getCount(): number {
        return this.props.Activity.getPathCount(this.props.exit);
    }

    private getActivity(): JSX.Element {
        // Only exits with a destination have activity
        if (this.props.exit.destination_node_uuid) {
            const key = `count:${this.props.exit.uuid}:${this.props.exit.destination_node_uuid}`;
            return (
                <Counter
                    key={key}
                    ref={this.props.Activity.registerListener}
                    getCount={this.getCount}
                    onUnmount={this.onUnmount}
                    containerStyle={styles.activity}
                    countStyle={styles.count}
                />
            );
        }
        return null;
    }

    public render(): JSX.Element {
        const localization = getLocalization(
            this.props.exit,
            this.props.localization,
            this.props.language
        );
        const exit = this.props.translating ? (localization.getObject() as Exit) : this.props.exit;
        const nameStyle = exit.name ? styles.name : '';
        const connected = this.props.exit.destination_node_uuid ? ' jtk-connected' : '';
        const dragNodeClasses = cx(styles.endpoint, connected);
        const confirmDelete =
            this.state.confirmDelete && this.props.exit.hasOwnProperty('destination_node_uuid');
        const confirm: JSX.Element = confirmDelete ? (
            <div
                {...createClickHandler(this.onDisconnect, () => this.props.dragging)}
                className="fe-x"
            />
        ) : null;
        const exitClasses: string = cx({
            [styles.exit]: true,
            ['plumb-exit']: true,
            [styles.translating]: this.props.translating,
            [styles.unnamed_exit]: exit.name == null,
            [styles.missing_localization]:
                exit.name && this.props.translating && !('name' in localization.localizedKeys),
            [styles.confirmDelete]: confirmDelete
        });
        const activity = this.getActivity();
        return (
            <div className={exitClasses}>
                <div className={nameStyle}>{exit.name}</div>
                <div
                    {...createClickHandler(this.onClick, () => this.props.dragging)}
                    id={`${this.props.node.uuid}:${this.props.exit.uuid}`}
                    className={dragNodeClasses}
                >
                    {confirm}
                </div>
                {activity}
            </div>
        );
    }
}

const mapStateToProps = ({
    flowContext: {
        definition: { localization }
    },
    editorState: { translating, language, dragActive }
}: AppState) => ({
    dragging: dragActive,
    translating,
    language,
    localization
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ disconnectExit }, dispatch);

const ConnectedExit = connect(
    mapStateToProps,
    mapDispatchToProps
)(ExitComp);

export default ConnectedExit;
