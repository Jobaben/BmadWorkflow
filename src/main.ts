/**
 * 3D Animation Learning Foundation - Entry Point
 *
 * This is the main entry point for the application.
 * It uses DemoRenderer, SceneManager, AnimationLoop, and FPS monitoring.
 *
 * Supports two modes:
 * - Playground: Original demo experience with demo buttons and sliders
 * - Wizard: Guided learning experience with code snippets and explanations
 *
 * @see story-029: Wizard UI Integration & Mode Toggle
 */

import './style.css';
import {
  DemoRenderer,
  SceneManager,
  AnimationLoop,
  FPSMonitor,
  InputManager,
  isWebGLAvailable,
  showWebGLFallback,
  AppModeManager,
} from './core';
import type { AppMode } from './core';
import { FPSDisplay, DemoSelector, ControlPanel } from './ui';
import { ParticleDemo, ObjectDemo, FluidDemo, CombinedDemo } from './demos';

// Wizard imports
import {
  WizardLayout,
  WizardNavigator,
  LearningPanel,
} from './wizard-ui';
import {
  CodeSnippetEngine,
  DemoAdapter,
  WizardController,
  SyntaxHighlighterComponent,
} from './wizard';
import type { DemoFactory } from './wizard';
import { wizardRegistry } from './wizard-data';
import {
  ContentBuffer,
  LoadingStateManager,
  AsyncContentLoader,
  ComponentInitializer,
} from './async';

// Import types and enums
import { DemoType } from './types';
import type { Demo, DemoInfo } from './types';

/** Reference to the demo renderer for cleanup */
let demoRenderer: DemoRenderer | null = null;

/** Reference to the control panel for cleanup */
let controlPanel: ControlPanel | null = null;

/** Reference to the animation loop for cleanup */
let animationLoop: AnimationLoop | null = null;

/** Reference to the FPS display for cleanup */
let fpsDisplay: FPSDisplay | null = null;

/** Reference to the input manager for cleanup */
let inputManager: InputManager | null = null;

/** Reference to the demo selector for cleanup */
let demoSelector: DemoSelector | null = null;

/** Reference to the scene manager */
let sceneManager: SceneManager | null = null;

/** Reference to the mode manager */
let modeManager: AppModeManager | null = null;

/** Bound keyboard handler for cleanup */
let boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;

/** Map of available demos */
const demos: Map<DemoType, Demo> = new Map();

/** Currently active demo */
let activeDemo: Demo | null = null;

// Wizard-related references (lazily initialized)
let wizardInitialized = false;
let wizardLayout: WizardLayout | null = null;
let wizardNavigator: WizardNavigator | null = null;
let learningPanel: LearningPanel | null = null;
let wizardController: WizardController | null = null;
let wizardDemoAdapter: DemoAdapter | null = null;
let codeSnippetEngine: CodeSnippetEngine | null = null;
let asyncContentLoader: AsyncContentLoader | null = null;
let contentBuffer: ContentBuffer | null = null;
let loadingStateManager: LoadingStateManager | null = null;
let componentInitializer: ComponentInitializer | null = null;

/** Mode toggle button reference */
let modeToggleButton: HTMLButtonElement | null = null;

/**
 * Resets the current demo to its initial state.
 * Also resets control panel parameters to their default values.
 * This is called when pressing the R key or clicking Reset in control panel.
 */
function resetCurrentDemo(): void {
  if (controlPanel) {
    // resetToDefaults will reset UI values and call the registered reset callbacks
    controlPanel.resetToDefaults();
  } else if (activeDemo) {
    // Fallback if no control panel
    activeDemo.reset();
  }
}

/**
 * Handles global keyboard events for application-wide shortcuts.
 * - R key: Reset current demo
 * - F key: Toggle FPS display
 * - W key: Toggle between playground and wizard modes
 * @param event - The keyboard event
 */
function handleKeyDown(event: KeyboardEvent): void {
  // Don't trigger shortcuts if user is typing in an input field
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return;
  }

  switch (event.key.toLowerCase()) {
    case 'r':
      // R key triggers reset
      resetCurrentDemo();
      break;
    case 'f':
      // F key toggles FPS display
      if (fpsDisplay) {
        fpsDisplay.toggle();
      }
      break;
    case 'w':
      // W key toggles mode
      if (modeManager) {
        modeManager.toggleMode();
      }
      break;
  }
}

/**
 * Switches to a new demo.
 * Stops the current demo, cleans up, and starts the new one.
 *
 * @param demoType - The type of demo to switch to
 */
function switchDemo(demoType: DemoType): void {
  if (!sceneManager) return;

  // Stop and remove current demo
  if (activeDemo) {
    activeDemo.stop();
    const objects = activeDemo.getSceneObjects();
    objects.forEach((obj) => sceneManager!.removeObject(obj));
  }

  // Get the new demo
  const newDemo = demos.get(demoType);
  if (!newDemo) {
    console.warn(`Demo not found: ${demoType}`);
    return;
  }

  // Set as active demo
  activeDemo = newDemo;

  // Add demo objects to scene
  const objects = activeDemo.getSceneObjects();
  objects.forEach((obj) => sceneManager!.addObject(obj));

  // Start the demo
  activeDemo.start();

  // Update control panel with new demo's parameters
  if (controlPanel) {
    controlPanel.setParameters(activeDemo.getParameterSchema());
  }
}

/**
 * Creates the mode toggle button.
 */
function createModeToggleButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'mode-toggle';
  button.type = 'button';
  updateModeToggleLabel(button, 'playground');

  button.addEventListener('click', () => {
    if (modeManager) {
      modeManager.toggleMode();
    }
  });

  return button;
}

/**
 * Updates the mode toggle button label based on current mode.
 */
function updateModeToggleLabel(button: HTMLButtonElement, mode: AppMode): void {
  if (mode === 'playground') {
    button.innerHTML = '<span class="mode-toggle__icon">&#128218;</span> Wizard Mode';
  } else {
    button.innerHTML = '<span class="mode-toggle__icon">&#127918;</span> Playground Mode';
  }
}

/**
 * Initialize wizard components lazily on first wizard mode activation.
 */
async function initializeWizardIfNeeded(): Promise<void> {
  if (wizardInitialized) {
    return;
  }

  console.log('Initializing wizard components...');

  const wizardAppContainer = document.getElementById('wizard-app');
  if (!wizardAppContainer) {
    console.error('Wizard app container not found');
    return;
  }

  try {
    // Create wizard layout
    wizardLayout = new WizardLayout(wizardAppContainer);

    // Create navigator in the header area
    const navigatorContainer = document.createElement('div');
    wizardLayout.getHeaderContainer().appendChild(navigatorContainer);
    wizardNavigator = new WizardNavigator(navigatorContainer);

    // Create learning panel
    learningPanel = new LearningPanel(wizardLayout.getPanelContainer());

    // Create code snippet engine
    codeSnippetEngine = new CodeSnippetEngine();

    // Create demo adapter with factories
    const demoFactories = new Map<DemoType, DemoFactory>([
      [DemoType.Particles, () => new ParticleDemo()],
      [DemoType.Objects, () => new ObjectDemo()],
      [DemoType.Fluid, () => new FluidDemo()],
      [DemoType.Combined, () => new CombinedDemo()],
    ]);
    wizardDemoAdapter = new DemoAdapter(demoFactories);

    // Create async infrastructure
    contentBuffer = new ContentBuffer();
    loadingStateManager = new LoadingStateManager();
    asyncContentLoader = new AsyncContentLoader(
      contentBuffer,
      loadingStateManager,
      codeSnippetEngine,
      wizardRegistry
    );

    // Create wizard controller with async loader
    wizardController = new WizardController({
      registry: wizardRegistry,
      adapter: wizardDemoAdapter,
      navigator: wizardNavigator,
      panel: learningPanel,
      engine: codeSnippetEngine,
      asyncLoader: asyncContentLoader,
    });

    // Wire layout navigation to controller
    wizardLayout.onPrevious(() => {
      wizardController?.previousStep().catch(console.error);
    });
    wizardLayout.onNext(() => {
      wizardController?.nextStep().catch(console.error);
    });

    // Update layout navigation state on step change
    wizardController.onStepChange((event) => {
      const allSteps = wizardRegistry.getAllSteps();
      const currentIndex = allSteps.findIndex(s => s.id === event.currentStep.id);
      wizardLayout?.setStepInfo(
        currentIndex + 1,
        allSteps.length,
        event.currentStep.title
      );
      wizardLayout?.setNavigationState(
        wizardController?.hasPreviousStep() ?? false,
        wizardController?.hasNextStep() ?? false
      );
    });

    // Start the wizard controller
    await wizardController.start();

    wizardInitialized = true;
    console.log('Wizard components initialized successfully');
  } catch (error) {
    console.error('Failed to initialize wizard:', error);
  }
}

/**
 * Handle mode change events.
 */
function handleModeChange(mode: AppMode, _previousMode: AppMode): void {
  console.log(`Mode changed to: ${mode}`);

  // Update body class for CSS-based visibility
  if (mode === 'wizard') {
    document.body.classList.remove('playground-mode-active');
    document.body.classList.add('wizard-mode-active');

    // Initialize wizard if needed
    initializeWizardIfNeeded().catch(console.error);
  } else {
    document.body.classList.remove('wizard-mode-active');
    document.body.classList.add('playground-mode-active');
  }

  // Update toggle button label
  if (modeToggleButton) {
    updateModeToggleLabel(modeToggleButton, mode);
  }
}

/**
 * Set up component pre-warming during idle time.
 */
function setupComponentPrewarming(): void {
  componentInitializer = new ComponentInitializer();

  // Register SyntaxHighlighterComponent for pre-warming
  const syntaxHighlighterComponent = new SyntaxHighlighterComponent();
  componentInitializer.register(syntaxHighlighterComponent);

  // Start idle-time initialization
  componentInitializer.initializeAll().then(() => {
    console.log('Component pre-warming complete');
  }).catch(error => {
    console.warn('Component pre-warming failed:', error);
  });
}

/**
 * Initialize the application when the DOM is ready.
 */
function init(): void {
  // Get the app container
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  // Check for WebGL support
  if (!isWebGLAvailable()) {
    showWebGLFallback(appContainer);
    return;
  }

  // Get the canvas element
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Initialize the renderer
  try {
    demoRenderer = new DemoRenderer(canvas);
  } catch (error) {
    console.error('Failed to initialize renderer:', error);
    showWebGLFallback(appContainer);
    return;
  }

  // Initialize the scene manager
  sceneManager = new SceneManager();

  // Connect camera to renderer for resize updates
  demoRenderer.setCamera(sceneManager.getCamera());

  // Initialize the input manager
  inputManager = new InputManager(canvas, sceneManager.getCamera());

  // Create FPS monitor and display
  const fpsMonitor = new FPSMonitor();
  fpsDisplay = new FPSDisplay(fpsMonitor);
  fpsDisplay.show();

  // Create the animation loop
  animationLoop = new AnimationLoop();

  // Initialize demos
  demos.set(DemoType.Particles, new ParticleDemo());
  demos.set(DemoType.Objects, new ObjectDemo());
  demos.set(DemoType.Fluid, new FluidDemo());
  demos.set(DemoType.Combined, new CombinedDemo());

  // Initialize control panel
  const controlPanelContainer = document.getElementById('control-panel-container');
  if (controlPanelContainer) {
    controlPanel = new ControlPanel(controlPanelContainer);

    // Handle parameter changes
    controlPanel.onParameterChange((key: string, value: unknown) => {
      if (activeDemo) {
        activeDemo.setParameter(key, value);
      }
    });

    // Handle reset
    controlPanel.onReset(() => {
      if (activeDemo) {
        activeDemo.reset();
      }
    });
  }

  // Initialize demo selector
  const demoSelectorContainer = document.getElementById('demo-selector-container');
  if (demoSelectorContainer) {
    demoSelector = new DemoSelector(demoSelectorContainer);

    // Configure available demos
    const demoInfos: DemoInfo[] = [
      { id: DemoType.Particles, label: 'Particles', description: 'Particle system demonstration' },
      { id: DemoType.Objects, label: 'Objects', description: '3D object animation' },
      { id: DemoType.Fluid, label: 'Fluid', description: 'Fluid physics simulation' },
      { id: DemoType.Combined, label: 'Combined', description: 'All demos together' },
    ];
    demoSelector.setDemos(demoInfos);

    // Handle demo selection changes
    demoSelector.onSelect((id: DemoType) => {
      switchDemo(id);
    });

    // Set initial selection and switch to it
    demoSelector.setSelected(DemoType.Particles);
    switchDemo(DemoType.Particles);
  }

  // Initialize mode manager
  modeManager = new AppModeManager('playground');
  modeManager.onModeChange(handleModeChange);

  // Set initial mode class on body
  document.body.classList.add('playground-mode-active');

  // Create mode toggle button
  const toggleContainer = document.getElementById('mode-toggle-container');
  if (toggleContainer) {
    modeToggleButton = createModeToggleButton();
    toggleContainer.appendChild(modeToggleButton);
  }

  // Set up component pre-warming during idle time
  setupComponentPrewarming();

  // Register the frame callback
  animationLoop.onFrame((deltaTime: number) => {
    // Update FPS monitor
    fpsMonitor.frame(deltaTime);
    fpsDisplay?.update();

    // Get input state and pass to active demo
    if (inputManager && activeDemo) {
      const inputState = inputManager.getInputState();
      activeDemo.onInput(inputState);
    }

    // Update active demo
    if (activeDemo) {
      activeDemo.update(deltaTime);
    }

    // Render the scene
    if (demoRenderer && sceneManager) {
      demoRenderer.render(sceneManager.getScene());
    }
  });

  // Start the animation loop
  animationLoop.start();

  // Register global keyboard shortcut handler for reset (R key)
  boundKeyHandler = handleKeyDown;
  window.addEventListener('keydown', boundKeyHandler);

  // Log success message
  console.log('3D Animation Learning Foundation initialized successfully');
  console.log('Animation loop running:', animationLoop.isRunning());
  console.log('Keyboard shortcuts: R = Reset, F = Toggle FPS, W = Toggle Wizard');
}

/**
 * Cleanup resources on page unload.
 */
function cleanup(): void {
  // Remove global keyboard handler
  if (boundKeyHandler) {
    window.removeEventListener('keydown', boundKeyHandler);
    boundKeyHandler = null;
  }

  if (animationLoop) {
    animationLoop.stop();
    animationLoop = null;
  }

  // Dispose all demos
  demos.forEach((demo) => {
    if ('dispose' in demo && typeof demo.dispose === 'function') {
      (demo as { dispose: () => void }).dispose();
    }
  });
  demos.clear();
  activeDemo = null;

  // Dispose playground components
  if (inputManager) {
    inputManager.dispose();
    inputManager = null;
  }
  if (fpsDisplay) {
    fpsDisplay.dispose();
    fpsDisplay = null;
  }
  if (demoSelector) {
    demoSelector.dispose();
    demoSelector = null;
  }
  if (controlPanel) {
    controlPanel.dispose();
    controlPanel = null;
  }
  if (demoRenderer) {
    demoRenderer.dispose();
    demoRenderer = null;
  }

  // Dispose mode manager
  if (modeManager) {
    modeManager.dispose();
    modeManager = null;
  }

  // Dispose wizard components
  if (wizardController) {
    wizardController.dispose();
    wizardController = null;
  }
  if (wizardDemoAdapter) {
    wizardDemoAdapter.dispose();
    wizardDemoAdapter = null;
  }
  if (asyncContentLoader) {
    asyncContentLoader.dispose();
    asyncContentLoader = null;
  }
  if (componentInitializer) {
    componentInitializer.dispose();
    componentInitializer = null;
  }
  if (codeSnippetEngine) {
    codeSnippetEngine.dispose();
    codeSnippetEngine = null;
  }
  if (wizardLayout) {
    wizardLayout.dispose();
    wizardLayout = null;
  }
  if (learningPanel) {
    learningPanel.dispose();
    learningPanel = null;
  }
  if (wizardNavigator) {
    wizardNavigator.dispose();
    wizardNavigator = null;
  }

  sceneManager = null;
  contentBuffer = null;
  loadingStateManager = null;
  wizardInitialized = false;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Export types to verify they're accessible
export type { DemoType, Demo };
