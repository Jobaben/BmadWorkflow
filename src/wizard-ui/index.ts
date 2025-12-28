/**
 * Wizard UI Components
 *
 * UI components for the wizard learning experience.
 * These components render educational content and code displays.
 */

export { CodeDisplay, injectCodeDisplayStyles, getCodeDisplayStyles } from './CodeDisplay';
export type { CodeDisplayOptions } from './CodeDisplay';

export {
  WizardLayout,
  injectWizardLayoutStyles,
  getWizardLayoutStyles,
} from './WizardLayout';

export {
  DemoViewport,
  injectDemoViewportStyles,
  getDemoViewportStyles,
} from './DemoViewport';

export {
  WizardNavigator,
  injectWizardNavigatorStyles,
  getWizardNavigatorStyles,
} from './WizardNavigator';

export {
  LearningPanel,
  injectLearningPanelStyles,
  getLearningPanelStyles,
} from './LearningPanel';

export {
  ParameterControl,
  injectParameterControlStyles,
  getParameterControlStyles,
} from './ParameterControl';
export type {
  ParameterControlType,
  ParameterControlConfig,
  ParameterControlCallbacks,
} from './ParameterControl';
