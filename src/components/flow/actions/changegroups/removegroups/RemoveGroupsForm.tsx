import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ChangeGroupsFormState } from 'components/flow/actions/changegroups/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { ChangeGroups } from 'flowTypes';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { mergeForm } from 'store/nodeEditor';
import { Required, validate } from 'store/validators';
import { renderIf } from 'utils';

import { initializeForm, stateToAction } from './helpers';
import styles from './RemoveGroupsForm.module.scss';

export const LABEL = 'Select the group(s) to remove the contact from.';
export const NOT_FOUND = 'Enter the name of an existing group';
export const PLACEHOLDER = 'Enter the name an existing group';
export const REMOVE_FROM_ALL = 'Remove from All';
export const REMOVE_FROM_ALL_DESC =
  "Remove the active contact from all groups they're a member of.";

export const labelSpecId = 'label';
export const fieldContainerSpecId = 'field-container';

export default class RemoveGroupsForm extends React.Component<
  ActionFormProps,
  ChangeGroupsFormState
> {
  public static contextTypes = {
    assetService: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings) as ChangeGroupsFormState;
    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleSave(): void {
    const valid = this.handleGroupsChanged(this.state.groups.value!);
    if (valid) {
      const newAction = stateToAction(this.props.nodeSettings, this.state);
      this.props.updateAction(newAction as ChangeGroups);
      this.props.onClose(false);
    }
  }

  private handleUpdate(keys: { groups?: Asset[]; removeAll?: boolean }): boolean {
    const updates: Partial<ChangeGroupsFormState> = {};

    // we only require groups if removeAll isn't checked
    let groupValidators = this.state.removeAll ? [] : [Required];

    if (keys.hasOwnProperty('removeAll')) {
      updates.removeAll = keys.removeAll;
      if (keys.removeAll) {
        groupValidators = [];
      }
    }

    if (keys.hasOwnProperty('groups')) {
      updates.groups = validate('Groups', keys.groups!, groupValidators);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handleGroupsChanged(groups: Asset[]): boolean {
    return this.handleUpdate({ groups });
  }

  public handleRemoveAllUpdate(removeAll: boolean): boolean {
    return this.handleUpdate({ removeAll });
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: 'Ok', onClick: this.handleSave },
      secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
    };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        {renderIf(!this.state.removeAll)(
          <div>
            <p data-spec={labelSpecId}>{LABEL}</p>
            <AssetSelector
              name="Groups"
              createPrefix="Create Group: "
              assets={this.props.assetStore.groups}
              entry={this.state.groups}
              searchable={true}
              onChange={this.handleGroupsChanged}
              multi={true}
            />
          </div>
        )}

        <CheckboxElement
          name={REMOVE_FROM_ALL}
          title={REMOVE_FROM_ALL}
          labelClassName={this.state.removeAll ? '' : styles.checkbox}
          checked={this.state.removeAll!}
          description={REMOVE_FROM_ALL_DESC}
          onChange={this.handleRemoveAllUpdate}
        />
      </Dialog>
    );
  }
}
