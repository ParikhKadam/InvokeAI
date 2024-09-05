import type { SerializableObject } from 'common/types';
import { CanvasEntityAdapterBase } from 'features/controlLayers/konva/CanvasEntityAdapterBase';
import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import type { CanvasEntityIdentifier, CanvasInpaintMaskState, Rect } from 'features/controlLayers/store/types';
import type { GroupConfig } from 'konva/lib/Group';
import { omit } from 'lodash-es';

export class CanvasEntityAdapterInpaintMask extends CanvasEntityAdapterBase<CanvasInpaintMaskState> {
  static TYPE = 'inpaint_mask_adapter';

  constructor(entityIdentifier: CanvasEntityIdentifier<'inpaint_mask'>, manager: CanvasManager) {
    super(entityIdentifier, manager, CanvasEntityAdapterInpaintMask.TYPE);
    this.subscriptions.add(this.manager.stateApi.store.subscribe(this.sync));
    this.sync(true);
  }

  sync = (force?: boolean) => {
    const prevState = this.state;
    const state = this.getSnapshot();

    if (!state) {
      this.destroy();
      return;
    }

    this.state = state;

    if (!force && prevState === this.state) {
      return;
    }

    if (force || this.state.isEnabled !== prevState.isEnabled) {
      this.syncIsEnabled();
    }
    if (force || this.state.isLocked !== prevState.isLocked) {
      this.syncIsLocked();
    }
    if (force || this.state.objects !== prevState.objects) {
      this.syncObjects();
    }
    if (force || this.state.position !== prevState.position) {
      this.syncPosition();
    }
    if (force || this.state.opacity !== prevState.opacity) {
      this.syncOpacity();
    }
    if (force || this.state.fill !== prevState.fill) {
      this.syncCompositingRectFill();
    }
    if (force) {
      this.syncCompositingRectSize();
    }
  };

  syncCompositingRectSize = () => {
    this.renderer.updateCompositingRectSize();
  };

  syncCompositingRectFill = () => {
    this.renderer.updateCompositingRectFill();
  };

  getHashableState = (): SerializableObject => {
    const keysToOmit: (keyof CanvasInpaintMaskState)[] = ['fill', 'name', 'opacity'];
    return omit(this.state, keysToOmit);
  };

  getCanvas = (rect?: Rect): HTMLCanvasElement => {
    // The opacity may have been changed in response to user selecting a different entity category, and the mask regions
    // should be fully opaque - set opacity to 1 before rendering the canvas
    const attrs: GroupConfig = { opacity: 1 };
    const canvas = this.renderer.getCanvas(rect, attrs);
    return canvas;
  };
}
