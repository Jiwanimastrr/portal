# Quick Input Refactoring Plan

This plan aims to unify the "Quick Input" logic across all four main tools (`random`, `order`, `seats`, `groups`) by introducing a shared custom hook (`useQuickInput.ts`) and updating the `QuickInputPanel` component. This will resolve the inconsistencies where `random` used a custom UI and `order/seats/groups` had edge cases regarding state management when switching between quick input and saved lists.

## User Review Required
No major UI changes or breaking functionalities. The user experience will become significantly more consistent across all tools.

## Open Questions
None at this moment. 

## Proposed Changes

### [Core]

#### [NEW] `hooks/useQuickInput.ts`
Create a centralized custom hook to manage the state of the Quick Input panel consistently.
- States: `inputMode` (`"quick" | "saved" | "create"`), `quickItems`, `quickActive`.
- Handles logic to reset `quickActive` when the user switches away from the `"quick"` tab.
- Provides `activeSourceItems` via `useMemo` so that parents automatically get the correct list of students based on the current mode and state.

#### [MODIFY] `components/shared/QuickInputPanel.tsx`
- Remove the local `inputMode` state.
- Accept `inputMode` and `onModeChange` as props so it operates as a controlled component, driven by the `useQuickInput` hook.

---

### [Pages]

#### [MODIFY] `app/random/page.tsx`
- Replace its custom inline Quick Input / Saved List UI with the `<QuickInputPanel />` component.
- Remove redundant state variables (`inputMode`, `quickText`, `quickItems`, `quickActive`, etc.).
- Call `useQuickInput()` and use its derived `activeSourceItems`.

#### [MODIFY] `app/order/page.tsx`
- Remove local `quickItems` and `quickActive` states.
- Call `useQuickInput()`.
- Update `useEffect` dependency to reset game states (results, revealed count, etc.) whenever `activeSourceItems` changes, instead of relying on multiple disjointed effects and handlers.

#### [MODIFY] `app/seats/page.tsx`
- Remove local `quickItems` and `quickActive` states.
- Call `useQuickInput()`.
- Unify its `useEffect` reset logic to watch `activeSourceItems`.

#### [MODIFY] `app/groups/page.tsx`
- Remove local `quickItems` and `quickActive` states.
- Call `useQuickInput()`.
- Unify its `useEffect` reset logic to watch `activeSourceItems`.

## Verification Plan
### Manual Verification
- Navigate to all 4 tools (Random, Order, Seats, Groups).
- Verify that the Quick Input panel is visible and functional with 3 tabs (빠른 입력, 명단 선택, 명단 생성).
- Ensure that submitting a quick list updates the active participants properly.
- Verify that switching to the "명단 선택" (Saved List) tab immediately applies the saved list and resets the game state.
- Ensure that the draw/shuffle functionality continues to work correctly in all tools.
