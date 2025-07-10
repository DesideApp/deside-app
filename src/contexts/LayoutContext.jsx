import { createContext, useState, useContext } from "react";

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [leftbarExpanded, setLeftbarExpanded] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        leftbarExpanded,
        setLeftbarExpanded,
        rightPanelOpen,
        setRightPanelOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
