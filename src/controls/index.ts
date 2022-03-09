import hyper from "@macrostrat/hyper";
import styles from "./main.styl";
import classNames from "classnames";
import { Collapse } from "@blueprintjs/core";
import { ErrorBoundary } from "@macrostrat/ui-components";

const h = hyper.styled(styles);

export interface ControlOptions<T> {
  options: T;
  setOptions(options: T): void;
}

type LayerButtonProps = {
  name: string;
  active: boolean;
  onClick(): void;
  className?: string;
};

export function LayerButton(props: LayerButtonProps) {
  const { name, active, onClick, className } = props;
  return h(
    "a.layer-button",
    {
      className: classNames({ active }, className),
      onClick,
    },
    name
  );
}

export function ExpandableControlsView({
  active,
  setActive,
  children,
  name,
  className = undefined,
}) {
  return h(
    "div.expandable-controls",
    { className: classNames({ active }, className) },
    [
      h(LayerButton, {
        name,
        active,
        onClick() {
          setActive(!active);
        },
      }),
      h.if(children != null)(
        Collapse,
        { isOpen: active },
        h(ErrorBoundary, null, h("div.expanded-controls", null, children))
      ),
    ]
  );
}
