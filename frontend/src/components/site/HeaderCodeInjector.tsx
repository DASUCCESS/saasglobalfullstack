"use client";

import { useEffect } from "react";

type HeaderCodeInjectorProps = {
  code: string;
};

const MANAGED_ATTR = "data-admin-header-code";

function toAttachableNode(node: Element): Element {
  if (node.tagName.toLowerCase() !== "script") {
    return node.cloneNode(true) as Element;
  }

  const script = document.createElement("script");
  for (const attr of Array.from(node.attributes)) {
    script.setAttribute(attr.name, attr.value);
  }
  script.textContent = node.textContent;
  return script;
}

export default function HeaderCodeInjector({ code }: HeaderCodeInjectorProps) {
  useEffect(() => {
    const existingNodes = document.head.querySelectorAll(`[${MANAGED_ATTR}="true"]`);
    existingNodes.forEach((node) => node.remove());

    if (!code.trim()) {
      return;
    }

    const template = document.createElement("template");
    template.innerHTML = code;

    const nodes = Array.from(template.content.childNodes).filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    ) as Element[];

    nodes.forEach((node) => {
      const attachableNode = toAttachableNode(node);
      attachableNode.setAttribute(MANAGED_ATTR, "true");
      document.head.appendChild(attachableNode);
    });

    return () => {
      const managedNodes = document.head.querySelectorAll(`[${MANAGED_ATTR}="true"]`);
      managedNodes.forEach((node) => node.remove());
    };
  }, [code]);

  return null;
}
