import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import {
  createCaseProps,
  createRenderNode,
  hasCases,
  resolveRoutes
} from 'components/flow/routers/helpers';
import { ResponseRouterFormState } from 'components/flow/routers/response/ResponseRouterForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Router, RouterTypes, SwitchRouter, Wait, WaitTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): ResponseRouterFormState => {
  let initialCases: CaseProps[] = [];

  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: 'result' };
  let timeout = -1;
  let expression = '';

  if (settings.originalNode && getType(settings.originalNode) === Types.wait_for_response) {
    const router = settings.originalNode.node.router as SwitchRouter;
    if (router) {
      if (hasCases(settings.originalNode.node)) {
        initialCases = createCaseProps(router.cases, settings.originalNode);
      }

      resultName = { value: router.result_name || '' };
    }

    const wait = settings.originalNode.node.router.wait;
    if (wait && wait.timeout && wait.timeout) {
      timeout = wait.timeout.seconds || -1;
      expression = wait.timeout.expression || '';
      if (expression.length > 0) {
        timeout = 0;
      }
    }
  }

  return {
    cases: initialCases,
    resultName,
    timeout,
    expression,
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: ResponseRouterFormState
): RenderNode => {
  const { cases, exits, defaultCategory, timeoutCategory, caseConfig, categories } = resolveRoutes(
    state.cases,
    state.timeout > -1,
    settings.originalNode.node
  );

  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  } else {
    optionalRouter.result_name = 'result';
  }

  const wait = { type: WaitTypes.msg } as Wait;
  if (state.timeout > 0) {
    wait.timeout = {
      seconds: state.timeout,
      category_uuid: timeoutCategory
    };
  } else if (state.timeout === 0) {
    wait.timeout = {
      expression: state.expression,
      category_uuid: timeoutCategory
    };
  }

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: defaultCategory,
    cases,
    categories,
    operand: DEFAULT_OPERAND,
    wait,
    ...optionalRouter
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.wait_for_response,
    [],
    { cases: caseConfig }
  );

  return newRenderNode;
};
