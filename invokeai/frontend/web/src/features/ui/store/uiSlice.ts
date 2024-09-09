import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PersistConfig, RootState } from 'app/store/store';
import { workflowLoadRequested } from 'features/nodes/store/actions';
import { atom } from 'nanostores';

import type { TabName, UIState } from './uiTypes';

const initialUIState: UIState = {
  _version: 2,
  activeTab: 'generation',
  shouldShowImageDetails: false,
  shouldShowProgressInViewer: true,
  panels: {},
  accordions: {},
  expanders: {},
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<TabName>) => {
      state.activeTab = action.payload;
    },
    setShouldShowImageDetails: (state, action: PayloadAction<boolean>) => {
      state.shouldShowImageDetails = action.payload;
    },
    setShouldShowProgressInViewer: (state, action: PayloadAction<boolean>) => {
      state.shouldShowProgressInViewer = action.payload;
    },
    panelsChanged: (state, action: PayloadAction<{ name: string; value: string }>) => {
      state.panels[action.payload.name] = action.payload.value;
    },
    accordionStateChanged: (state, action: PayloadAction<{ id: string; isOpen: boolean }>) => {
      const { id, isOpen } = action.payload;
      state.accordions[id] = isOpen;
    },
    expanderStateChanged: (state, action: PayloadAction<{ id: string; isOpen: boolean }>) => {
      const { id, isOpen } = action.payload;
      state.expanders[id] = isOpen;
    },
  },
  extraReducers(builder) {
    builder.addCase(workflowLoadRequested, (state) => {
      state.activeTab = 'workflows';
    });
  },
});

export const {
  setActiveTab,
  setShouldShowImageDetails,
  setShouldShowProgressInViewer,
  panelsChanged,
  accordionStateChanged,
  expanderStateChanged,
} = uiSlice.actions;

export const selectUiSlice = (state: RootState) => state.ui;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const migrateUIState = (state: any): any => {
  if (!('_version' in state)) {
    state._version = 1;
  }
  if (state._version === 1) {
    state.activeTab = 'generation';
    state._version = 2;
  }
  return state;
};

export const uiPersistConfig: PersistConfig<UIState> = {
  name: uiSlice.name,
  initialState: initialUIState,
  migrate: migrateUIState,
  persistDenylist: ['shouldShowImageDetails'],
};

export const LEFT_PANEL_MIN_SIZE_PX = 400;
export const LEFT_PANEL_MIN_SIZE_PCT = 20;
export const TABS_WITH_LEFT_PANEL: TabName[] = ['generation', 'upscaling', 'workflows'] as const;
export const $isLeftPanelOpen = atom(true);
export const selectWithLeftPanel = createSelector(selectUiSlice, (ui) => TABS_WITH_LEFT_PANEL.includes(ui.activeTab));

export const TABS_WITH_RIGHT_PANEL: TabName[] = ['generation', 'upscaling', 'workflows', 'gallery'] as const;
export const RIGHT_PANEL_MIN_SIZE_PX = 390;
export const RIGHT_PANEL_MIN_SIZE_PCT = 20;
export const $isRightPanelOpen = atom(true);
export const selectWithRightPanel = createSelector(selectUiSlice, (ui) => TABS_WITH_RIGHT_PANEL.includes(ui.activeTab));
