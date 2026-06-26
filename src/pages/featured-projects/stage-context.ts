import { createContext, useContext } from "react";

interface StageContextValue {
    register: (index: number, el: HTMLElement | null) => void;
}

/** Lets each FloatCard3D hand its DOM node to the HorizontalStage that drives it. */
export const StageContext = createContext<StageContextValue | null>(null);

export const useStageRegister = () => useContext(StageContext);
