import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, HeaderStyle } from '~/components/dialog/Dialog';
import Flipper from '~/components/flipper/Flipper';
import { initializeForm, stateToAction } from '~/components/flow/actions/sendmsg/helpers';
import * as localStyles from '~/components/flow/actions/sendmsg/SendMsgForm.scss';
import CheckboxElement from '~/components/form/checkbox/CheckboxElement';
import TaggingElement from '~/components/form/select/tags/TaggingElement';
import TextInputElement, { Count } from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { Type } from '~/config/typeConfigs';
import { SendMsg } from '~/flowTypes';
import {
    FormState,
    mergeForm,
    NodeEditorSettings,
    StringArrayEntry,
    StringEntry
} from '~/store/nodeEditor';
import { validate, validateMaxOfTen, validateRequired } from '~/store/validators';

export interface SendMsgFormProps {
    // action details
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;

    // update handlers
    updateAction(action: SendMsg): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export interface SendMsgFormState extends FormState {
    text: StringEntry;
    quickReplies: StringArrayEntry;
    sendAll: boolean;
}

export default class SendMsgForm extends React.Component<SendMsgFormProps, SendMsgFormState> {
    constructor(props: SendMsgFormProps) {
        super(props);
        this.state = initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    private handleUpdate(keys: {
        text?: string;
        sendAll?: boolean;
        quickReplies?: string[];
    }): boolean {
        const updates: Partial<SendMsgFormState> = {};

        if (keys.hasOwnProperty('text')) {
            updates.text = validate('Message', keys.text, [validateRequired]);
        }

        if (keys.hasOwnProperty('sendAll')) {
            updates.sendAll = keys.sendAll;
        }

        if (keys.hasOwnProperty('quickReplies')) {
            updates.quickReplies = validate('Quick Replies', keys.quickReplies, [validateMaxOfTen]);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleMessageUpdate(text: string): boolean {
        return this.handleUpdate({ text });
    }

    public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
        return this.handleUpdate({ quickReplies });
    }

    public handleSendAllUpdate(sendAll: boolean): boolean {
        return this.handleUpdate({ sendAll });
    }

    private handleSave(): void {
        // make sure we validate untouched text fields
        const valid = this.handleUpdate({
            text: this.state.text.value
        });

        if (valid) {
            this.props.updateAction(
                stateToAction(this.props.nodeSettings.originalAction.uuid, this.state)
            );

            // notify our modal we are done
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        return (
            <Flipper
                front={
                    <Dialog
                        title={this.props.typeConfig.name}
                        headerClass={this.props.typeConfig.type}
                        buttons={this.getButtons()}
                    >
                        <TypeList
                            __className=""
                            initialType={this.props.typeConfig}
                            onChange={this.props.onTypeChange}
                        />
                        <TextInputElement
                            name="Message"
                            showLabel={false}
                            count={Count.SMS}
                            onChange={this.handleMessageUpdate}
                            entry={this.state.text}
                            autocomplete={true}
                            focus={true}
                            textarea={true}
                        />
                    </Dialog>
                }
                back={
                    <Dialog
                        title={this.props.typeConfig.name}
                        subtitle="Advanced Settings"
                        headerStyle={HeaderStyle.BARBER}
                        headerClass={this.props.typeConfig.type}
                        headerIcon="fe-cog"
                    >
                        <p>Quick Replies are made into buttons for supported channels</p>
                        <TaggingElement
                            name="Replies"
                            placeholder="Quick Replies"
                            prompt="Enter a Quick Reply"
                            onChange={this.handleQuickRepliesUpdate}
                            onCheckValid={() => true}
                            onValidPrompt={(value: string) => `New Reply "${value}"`}
                            entry={this.state.quickReplies}
                        />
                        <CheckboxElement
                            name="All Destinations"
                            title="All Destinations"
                            labelClassName={localStyles.checkbox}
                            checked={this.state.sendAll}
                            description="Send a message to all destinations known for this contact."
                            onChange={this.handleSendAllUpdate}
                        />
                    </Dialog>
                }
                flipped={this.props.nodeSettings.showAdvanced}
            />
        );
    }
}
