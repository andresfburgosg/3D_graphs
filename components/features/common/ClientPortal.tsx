"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { ClientPortalProps } from "@/types/ui";

const ClientPortal: React.FC<ClientPortalProps> = ({ children, selector }) => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  const setMarker = useCallback(
    (marker: HTMLSpanElement | null) => {
      if (!marker) return;

      const node = document.querySelector<HTMLElement>(selector);
      setPortalNode((currentNode) =>
        currentNode === node ? currentNode : node,
      );
    },
    [selector],
  );

  return (
    <>
      <span ref={setMarker} hidden aria-hidden="true" />
      {portalNode ? createPortal(children, portalNode) : null}
    </>
  );
};

export default ClientPortal;
