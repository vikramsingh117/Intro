import { useId, useState } from "react";
import styles from "../styles/ProjectDetails.module.css";

export default function ProjectDetails({ children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className={styles.details}>
    <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>Under the hood <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <div id={id} className={styles.panel} data-open={open} aria-hidden={!open} inert={!open ? "" : undefined}><div><p>{children}</p></div></div>
  </div>;
}
