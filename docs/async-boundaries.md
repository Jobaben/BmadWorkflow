# Sync/Async Boundary Guidelines

This document defines the boundaries between synchronous and asynchronous code zones in the 3D Animation Learning Foundation codebase. Following these guidelines ensures consistent 60fps animation performance.

## Zone Overview

The codebase is organized into three zones:

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNC ZONE                                │
│  (16ms budget per frame - NO await allowed)                     │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │AnimationLoop│  │InputManager │  │DemoRenderer/SceneManager│  │
│  │             │  │             │  │                         │  │
│  │ tick()      │  │getInputState│  │update(), render()       │  │
│  │ callbacks   │  │(synchronous)│  │(synchronous)            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    ContentBuffer (BRIDGE)                   │ │
│  │                                                             │ │
│  │  get(key): PreparedContent | undefined  ← sync read         │ │
│  │  has(key): boolean                      ← sync check        │ │
│  │  set(key, content): void                ← async writes here │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ▲                                      │
└───────────────────────────│──────────────────────────────────────┘
                            │
┌───────────────────────────│──────────────────────────────────────┐
│                           │                                      │
│                    ASYNC ZONE                                    │
│  (Can await, runs outside render loop)                           │
│                                                                  │
│  ┌──────────────────┐  ┌────────────────────┐                   │
│  │AsyncContentLoader│  │ComponentInitializer│                   │
│  │                  │  │                    │                   │
│  │loadStep()        │  │initializeAll()     │                   │
│  │preloadSteps()    │  │(idle-time init)    │                   │
│  └──────────────────┘  └────────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐  ┌────────────────────┐                   │
│  │LoadingStateManager│ │SyntaxHighlighter   │                   │
│  │                  │  │                    │                   │
│  │(threshold delays)│  │initialize()        │                   │
│  └──────────────────┘  │highlightCode()     │                   │
│                        └────────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

## Zone Definitions

### SYNC ZONE: Must Be Synchronous

Components in the sync zone execute within the requestAnimationFrame callback and have a strict 16ms budget per frame to maintain 60fps.

| Component | File | Reason |
|-----------|------|--------|
| AnimationLoop | `src/core/AnimationLoop.ts` | RAF callback - 16ms budget |
| InputManager | `src/core/InputManager.ts` | Event handlers must be synchronous |
| DemoRenderer | `src/core/DemoRenderer.ts` | Render call in frame callback |
| SceneManager | `src/core/SceneManager.ts` | Scene updates in frame callback |
| Demo update() | `src/demos/*.ts` | Called every frame |
| ContentBuffer.get() | `src/async/ContentBuffer.ts` | Read path must be O(1) |

**Rules for SYNC ZONE:**
1. NO `async/await` keywords
2. NO Promises that block
3. NO network requests
4. NO file system access
5. All data access via synchronous Map/Object lookups
6. If data isn't ready, show placeholder (don't wait)

### ASYNC ZONE: Should Be Asynchronous

Components in the async zone run outside the render loop and can perform expensive operations without affecting frame rate.

| Component | File | Reason |
|-----------|------|--------|
| AsyncContentLoader | `src/async/AsyncContentLoader.ts` | Content loading pipeline |
| ComponentInitializer | `src/async/ComponentInitializer.ts` | Idle-time initialization |
| LoadingStateManager | `src/async/LoadingStateManager.ts` | Threshold-based indicators |
| SyntaxHighlighter | `src/wizard/SyntaxHighlighter.ts` | Shiki initialization is async |
| CodeSnippetEngine | `src/wizard/CodeSnippetEngine.ts` | Snippet loading is async |

**Rules for ASYNC ZONE:**
1. Use `async/await` for all I/O operations
2. Support cancellation via AbortController
3. Write results to ContentBuffer for sync zone access
4. Use requestIdleCallback for non-urgent work
5. Coordinate with LoadingStateManager for UI feedback

### BRIDGE: ContentBuffer

The ContentBuffer is the sole bridge between zones:

```typescript
// ASYNC ZONE writes:
const content = await loadContent();
contentBuffer.set('step-1', content);

// SYNC ZONE reads (inside render loop):
const content = contentBuffer.get('step-1');
if (content) {
  // Use content - no await needed
} else {
  // Show loading placeholder
}
```

## Decision Criteria

When adding new functionality, use this decision tree:

```
Does this code run inside requestAnimationFrame callback?
├── YES → SYNC ZONE
│   └── Can the operation complete in <1ms?
│       ├── YES → Synchronous OK
│       └── NO → Refactor to prepare data in ASYNC ZONE first
│
└── NO → Is this initialization or content loading?
    ├── YES → ASYNC ZONE
    │   └── Write results to ContentBuffer
    └── NO → Is this event handling?
        ├── YES → SYNC ZONE (event handlers are sync)
        └── NO → Evaluate case-by-case
```

## Code Patterns

### Correct: Async Loading, Sync Display

```typescript
// ASYNC ZONE: Load content ahead of time
class AsyncContentLoader {
  async loadStep(stepId: string): Promise<void> {
    const content = await this.engine.getSnippet(ref);
    this.buffer.set(stepId, content);  // Write to bridge
    this.loadingManager.stopLoading(stepId);
  }
}

// SYNC ZONE: Display from buffer
class WizardUI {
  render(stepId: string): void {
    const content = this.buffer.get(stepId);  // Sync read
    if (content) {
      this.displayContent(content);
    } else {
      this.displayLoading();
    }
  }
}
```

### Incorrect: Await in Render Loop (ANTI-PATTERN)

```typescript
// BAD: This blocks the render loop!
class WizardUI {
  async render(stepId: string): Promise<void> {
    const content = await this.loader.loadStep(stepId);  // BLOCKS FRAME!
    this.displayContent(content);
  }
}
```

### Correct: Pre-warming During Idle Time

```typescript
// Use ComponentInitializer for idle-time pre-warming
const syntaxHighlighter: AsyncInitializable = {
  id: 'syntax-highlighter',
  priority: 1,  // Lower = earlier
  isCritical: true,
  isInitialized: false,
  async initialize() {
    await createHighlighter({ themes: [...], langs: [...] });
    this.isInitialized = true;
  }
};

componentInitializer.register(syntaxHighlighter);
componentInitializer.initializeAll();  // Runs during idle time
```

### Correct: Cancellation on Navigation

```typescript
// Cancel pending loads to prevent race conditions
class AsyncContentLoader {
  private abortController: AbortController | null = null;

  async loadStep(stepId: string): Promise<void> {
    // Cancel previous load
    this.abortController?.abort();
    this.abortController = new AbortController();

    try {
      const content = await this.fetch(stepId, this.abortController.signal);
      this.buffer.set(stepId, content);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Expected - user navigated away
        return;
      }
      throw error;
    }
  }
}
```

## Zone Documentation Comments

All files should include a zone comment at the top:

```typescript
/**
 * @zone SYNC
 * @reason Animation frame callback - 16ms budget
 *
 * This file contains synchronous-only code. DO NOT use async/await.
 */
```

```typescript
/**
 * @zone ASYNC
 * @reason Content loading - runs outside render loop
 *
 * This file contains async code. Results must be written to ContentBuffer.
 */
```

```typescript
/**
 * @zone BRIDGE
 * @reason Sync reads, async writes
 *
 * This file bridges SYNC and ASYNC zones. Read methods are O(1) sync.
 */
```

## Performance Guidelines

1. **16ms Budget**: The sync zone has 16ms total per frame (60fps). Individual operations should be <1ms.

2. **Idle Time**: Use `requestIdleCallback` for non-urgent async work like preloading adjacent content.

3. **Threshold Delays**: Use LoadingStateManager to avoid flickering - only show loading indicators after 150ms.

4. **Cancellation**: Always use AbortController for cancellable async operations to prevent wasted work.

5. **Pre-warming**: Initialize expensive resources (like Shiki highlighter) during idle time before they're needed.

## Related Files

- `src/async/ContentBuffer.ts` - Bridge data structure
- `src/async/LoadingStateManager.ts` - Loading indicator coordination
- `src/async/ComponentInitializer.ts` - Idle-time pre-warming
- `src/async/AsyncContentLoader.ts` - Content loading pipeline
- `src/async/types.ts` - Shared type definitions

## Related ADRs

- ADR-004: AbortController for cancellation pattern
- ADR-003: Static syntax highlighting with Shiki
