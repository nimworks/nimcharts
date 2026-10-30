import type { IRaceTimelineFrame } from '@_types/data';

/**
 * Functional callback interface mapping real-time synchronization signals.
 */
export interface ITimelineCallbacks {
  /**
   * Broadcasts frame parameters and the active interpolation progression ratio weight on every clock tick.
   * @param currentFrame The structural frame boundaries of the current time milestone.
   * @param nextFrame The structural target destination frame metadata, or null if terminating.
   * @param interpolationAlpha A normalized ratio float value between 0.0 and 1.0 indicating transition progress.
   */
  onTick: (currentFrame: IRaceTimelineFrame, nextFrame: IRaceTimelineFrame | null, interpolationAlpha: number) => void;
  /**
   * Execution hook triggered automatically when the timeline successfully reaches its terminal milestone block.
   */
  onComplete?: () => void;
}

export class Timeline {
  private frames: IRaceTimelineFrame[];
  private currentFrameIndex: number = 0;
  private durationPerFrame: number; // Duration of single frame transition in milliseconds

  // Animation loop state flags
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private elapsedInFrame: number = 0;
  private animationFrameId: number | null = null;
  private callbacks: ITimelineCallbacks;

  constructor(frames: IRaceTimelineFrame[], durationPerFrame: number = 2000, callbacks: ITimelineCallbacks) {
    if (frames.length === 0) {
      throw new Error('Timeline Engine Error: Provided dataset array contains zero chronological milestones.');
    }
    this.frames = frames;
    this.durationPerFrame = durationPerFrame;
    this.callbacks = callbacks;
  }

  /**
   * Main game-loop clock tick synchronization callback linked directly to the browser hardware refresh rate.
   */
  private loop = (timestamp: number): void => {
    if (!this.isPlaying) return;

    if (!this.startTime) {
      this.startTime = timestamp;
    }

    // Measure true elapsed milliseconds inside the active frame transition window
    const progress = timestamp - this.startTime;
    this.elapsedInFrame = progress;

    const currentFrame = this.frames[this.currentFrameIndex];
    const nextFrame = this.currentFrameIndex < this.frames.length - 1 ? this.frames[this.currentFrameIndex + 1] : null;

    // Calculate a normalized progression ratio float clamped strictly between 0.0 and 1.0
    const alpha = Math.min(progress / this.durationPerFrame, 1);

    // Broadcast computed parameters up to the active listening chart engine
    this.callbacks.onTick(currentFrame, nextFrame, alpha);

    // Evaluate frame transition completion boundaries
    if (progress >= this.durationPerFrame) {
      if (this.currentFrameIndex < this.frames.length - 2) {
        // Step forward cleanly to initialize the next milestone frame segment
        this.currentFrameIndex++;
        this.startTime = timestamp;
        this.elapsedInFrame = 0;
      } else {
        // Halt loops smoothly upon reaching terminal time markers
        this.isPlaying = false;
        if (this.callbacks.onComplete) {
          this.callbacks.onComplete();
        }
        return;
      }
    }

    // Recursively queue the subsequent hardware frame refresh tick loop request
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Initiates or resumes the chronological timeline clock operations.
   */
  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Adjust timing offset parameters to allow seamless playback resume operations from paused offsets
    this.startTime = performance.now() - this.elapsedInFrame;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Freezes execution frames safely, maintaining the active temporal offsets.
   */
  public pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Rewinds operational timelines back to initial indices.
   */
  public reset(): void {
    this.pause();
    this.currentFrameIndex = 0;
    this.startTime = 0;
    this.elapsedInFrame = 0;

    // Force a baseline rendering pass initialization broadcast
    const currentFrame = this.frames[0];
    const nextFrame = this.frames.length > 1 ? this.frames[1] : null;
    this.callbacks.onTick(currentFrame, nextFrame, 0);
  }

  /**
   * Public data query helper mapping active tracking indices out to components.
   */
  public getCurrentPeriod(): string | number {
    return this.frames[this.currentFrameIndex].period;
  }
}
