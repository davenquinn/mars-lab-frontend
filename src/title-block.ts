import { hyperStyled } from "@macrostrat/hyper";
import styles from "./main.styl";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { DisplayQuality } from "cesium-viewer";
import { MapBackend } from "./state";
import { Icon, Button } from "@blueprintjs/core";

const h = hyperStyled(styles);

const Link = ({ to, children, ...rest }) => {
  return h(
    "li",
    null,
    h(NavLink, { to, activeClassName: styles["is-active"], ...rest }, children)
  );
};

const Control = (props) => {
  const { options, title, onChange, selected } = props;
  return h("span.control", [
    h.if(title != null)("span.control-title", title + ":"),
    h(
      Object.entries(options).map((d) => {
        const onClick = (e) => {
          onChange(d[1]);
          e.preventDefault();
        };
        let main;
        if (d[1] == selected) {
          main = h("span.option.selected", { key: d[0] }, d[0]);
        } else {
          main = h("a.option", { href: "#", onClick, key: d[0] }, d[0]);
        }
        return h([" ", main]);
      })
    ),
  ]);
};

const QualityControl = () => {
  const selected = useSelector((s) => s.displayQuality);
  const dispatch = useDispatch();
  const options = {
    low: DisplayQuality.Low,
    high: DisplayQuality.High,
  };
  const onChange = (value: DisplayQuality) =>
    dispatch({ type: "set-display-quality", value });
  return h(Control, { title: "Quality", options, selected, onChange });
};

const DebuggerControl = () => {
  const debug = useSelector((s) => s.debug);
  const dispatch = useDispatch();
  return h(
    "a.control",
    {
      href: "#",
      onClick(e) {
        dispatch({ type: "toggle-debugger" });
        e.preventDefault();
      },
    },
    (debug ? "hide" : "show") + " debugger"
  );
};

const ExaggerationControl = () => {
  const selected = useSelector((s) => s.verticalExaggeration);
  const dispatch = useDispatch();

  const options = {
    none: 1,
    "1.5x": 1.5,
    "2x": 2,
  };
  const onChange = (value: number) =>
    dispatch({ type: "set-exaggeration", value });
  return h(Control, {
    title: "terrain exaggeration",
    options,
    selected,
    onChange,
  });
};

function MapTypeControl() {
  const mapBackend = useSelector((s) => s.mapBackend);
  const dispatch = useDispatch();
  const options = {
    "3d": MapBackend.Globe,
    "2d": MapBackend.Flat,
  };
  return h(Control, {
    options,
    selected: mapBackend,
    onChange() {
      dispatch({ type: "toggle-map-backend" });
    },
  });
}

const MiniControls = () => {
  return h("div.mini-controls", [
    h(QualityControl),
    ", ",
    h(ExaggerationControl),
    ", ",
    h(MapTypeControl),
    ", ",
    h(DebuggerControl),
    ".",
  ]);
};

function IconLink(props) {
  const { icon, to, ...rest } = props;
  return h(Link, { to, ...rest }, h(Icon, { icon }));
}

const SoftwareInfo = () => {
  return h("div.software-info", [
    h("p.version", [
      `${NPM_VERSION} – ${COMPILE_DATE}`,
      " (",
      h(NavLink, { to: "/changelog" }, "changelog"),
      ", ",
      h("a", { href: GITHUB_REV_LINK }, GIT_COMMIT_HASH),
      ")",
    ]),
    h("p.description", [
      "The Mars lab software stack is a set of application components and image-processing utilities that ",
      "support centralized management of Mars datasets for scientific analysis. ",
      h(NavLink, { to: "/about" }, ["Learn more →"]),
    ]),
    h("p.directions", "Drag the 3D display to pan, Ctrl+drag to rotate."),
    h(MiniControls),
  ]);
};

const Navbar = () => {
  return h(
    "nav",
    null,
    h("ul", [
      h(IconLink, { to: "/layers", icon: "layers" }),
      h(IconLink, {
        to: "/list",
        className: styles["positions"],
        icon: "map-marker",
      }),
    ])
  );
};

const TitleBlock = () => {
  const uiExpanded = useSelector((s) => s.uiExpanded);
  const dispatch = useDispatch();
  return h("div.title-block", [
    h(Icon, {
      className: "ui-button",
      icon: uiExpanded ? "collapse-all" : "expand-all",
      onClick: () => dispatch({ type: "expand-ui", value: !uiExpanded }),
    }),
    h(
      NavLink,
      {
        to: "/",
        exact: true,
        onClick: () => dispatch({ type: "expand-ui", value: true }),
      },
      h("h1.title", ["Mars Lab"])
    ),
    h("div.spacer"),
    h.if(uiExpanded)(Navbar),
  ]);
};

export { TitleBlock, Link, Control, SoftwareInfo };
