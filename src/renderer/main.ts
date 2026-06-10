import "./styles.css";
import App from "./App.svelte";
import { mount } from "svelte";

const target = document.getElementById("app");
if (!target) {
  throw new Error("Mark Rover: missing #app mount target");
}

const app = mount(App, { target });

export default app;
