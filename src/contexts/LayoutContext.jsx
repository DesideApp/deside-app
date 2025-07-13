import { createContext, useContext, useState, useEffect } from "react";

const LayoutContext = createContext({
  leftbarExpanded: false,
  toggleLeftbar: () => {},
  setLeftbarExpanded: () => {},
  rightPanelOpen: false,
  toggleRightPanel: () => {},
  setRightPanelOpen: () => {},
  leftbarWidth: 0,
  device: "desktop",
  isDesktop: true,
  isTablet: false,
  isMobile: false,
});

export const LayoutProvider = ({ children }) => {
  // Leftbar state
  const [leftbarExpanded, setLeftbarExpanded] = useState(false);

  // RightPanel state
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Device type
  const [device, setDevice] = useState("desktop");

  // Breakpoints
  const DESKTOP_BREAKPOINT = 1024;
  const TABLET_BREAKPOINT = 768;

  // Update device on resize
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width > DESKTOP_BREAKPOINT) {
        setDevice("desktop");
      } else if (width > TABLET_BREAKPOINT) {
        setDevice("tablet");
      } else {
        setDevice("mobile");
      }
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Leftbar widths
  const collapsedWidthDesktop = 50;
  const expandedWidthDesktop = 350;

  const leftbarWidth = device === "desktop"
    ? (leftbarExpanded ? expandedWidthDesktop : collapsedWidthDesktop)
    : 0;

  const toggleLeftbar = () => {
    setLeftbarExpanded((prev) => !prev);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen((prev) => !prev);
  };

  return (
    <LayoutContext.Provider
      value={{
        leftbarExpanded,
        setLeftbarExpanded,
        toggleLeftbar,
        rightPanelOpen,
        setRightPanelOpen,
        toggleRightPanel,
        leftbarWidth,
        device,
        isDesktop: device === "desktop",
        isTablet: device === "tablet",
        isMobile: device === "mobile",
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);

export { LayoutContext };
