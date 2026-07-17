"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SignalState } from "@/lib/motion-system";

export interface SignalCycleOptions {
  reducedMotion: boolean | null;
  processingMs: number;
  verifiedMs: number;
  initialState?: Extract<SignalState, "idle" | "stable">;
  autoStart?: boolean;
  startDelayMs?: number;
}

export interface SignalCycleController {
  state: SignalState;
  replay: (delayMs?: number) => boolean;
  begin: () => boolean;
  verify: () => void;
  settle: () => void;
  settleAfter: (delayMs: number) => void;
  cancel: () => void;
}

export function useSignalCycle({
  reducedMotion,
  processingMs,
  verifiedMs,
  initialState: requestedInitialState = "idle",
  autoStart = false,
  startDelayMs = 0,
}: SignalCycleOptions): SignalCycleController {
  const isReduced = reducedMotion === true;
  const reducedRef = useRef(isReduced);
  reducedRef.current = isReduced;

  const initialState: SignalState = isReduced ? "stable" : requestedInitialState;
  const [state, setState] = useState<SignalState>(initialState);
  const stateRef = useRef<SignalState>(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commitState = useCallback((nextState: SignalState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const schedule = useCallback(
    (callback: () => void, delayMs: number) => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        callback();
      }, Math.max(0, delayMs));
    },
    [clearTimer],
  );

  const settle = useCallback(() => {
    clearTimer();
    commitState("stable");
  }, [clearTimer, commitState]);

  const enterVerified = useCallback(() => {
    if (reducedRef.current) {
      settle();
      return;
    }

    commitState("verified");
    schedule(settle, verifiedMs);
  }, [commitState, schedule, settle, verifiedMs]);

  const enterProcessing = useCallback(() => {
    if (reducedRef.current) {
      settle();
      return;
    }

    commitState("processing");
    schedule(enterVerified, processingMs);
  }, [commitState, enterVerified, processingMs, schedule, settle]);

  const replay = useCallback(
    (delayMs = 0) => {
      if (reducedRef.current) {
        settle();
        return false;
      }

      if (
        timerRef.current !== null ||
        stateRef.current === "processing" ||
        stateRef.current === "verified"
      ) {
        return false;
      }

      if (delayMs > 0) {
        commitState("idle");
        schedule(enterProcessing, delayMs);
      } else {
        enterProcessing();
      }
      return true;
    },
    [commitState, enterProcessing, schedule, settle],
  );

  const begin = useCallback(() => {
    if (reducedRef.current) {
      settle();
      return false;
    }

    clearTimer();
    commitState("processing");
    return true;
  }, [clearTimer, commitState, settle]);

  const verify = useCallback(() => {
    clearTimer();
    enterVerified();
  }, [clearTimer, enterVerified]);

  const settleAfter = useCallback(
    (delayMs: number) => {
      if (reducedRef.current) {
        settle();
        return;
      }
      schedule(settle, delayMs);
    },
    [schedule, settle],
  );

  const cancel = useCallback(() => {
    clearTimer();
    commitState(reducedRef.current ? "stable" : requestedInitialState);
  }, [clearTimer, commitState, requestedInitialState]);

  useEffect(() => {
    if (isReduced) {
      settle();
      return;
    }

    if (autoStart && stateRef.current === "idle" && timerRef.current === null) {
      replay(startDelayMs);
    }
  }, [autoStart, isReduced, replay, settle, startDelayMs]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        settle();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [settle]);

  useEffect(() => clearTimer, [clearTimer]);

  return { state, replay, begin, verify, settle, settleAfter, cancel };
}
