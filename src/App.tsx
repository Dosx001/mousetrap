import { invoke, window as tauwin } from "@tauri-apps/api";
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/api/globalShortcut";
import Region from "components/Region";
import { createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

function App() {
  let top!: HTMLDivElement,
    left!: HTMLDivElement,
    center!: HTMLDivElement,
    right!: HTMLDivElement,
    bottom!: HTMLDivElement;
  const [show, setShow] = createSignal(false);
  const [size, setSize] = createStore({
    width: window.screen.width,
    height: window.screen.height,
    x: 0,
    y: 0,
  });
  const updateSize = (el: HTMLDivElement) => {
    setSize({
      width: el.clientWidth,
      height: el.clientHeight,
      x: el.getClientRects()[0].x,
      y: el.getClientRects()[0].y,
    });
  };
  const reset = () => {
    setSize({
      width: window.screen.width,
      height: window.screen.height,
      x: 0,
      y: 0,
    });
    setShow(false);
  };
  const getPosition = (ref: HTMLDivElement) => {
    const rect = ref.querySelector("span")!.getClientRects()[0];
    return {
      x: Math.floor(rect.x),
      y: Math.floor(rect.y),
    };
  };
  const blur = () => {
    invoke("debug").then((res) => {
      if (!res) tauwin.appWindow.hide()!;
    })!;
  };
  const hotkey = (alt: boolean, ref: HTMLDivElement) => {
    if (alt) {
      updateSize(ref);
      setShow(true);
    } else {
      tauwin.appWindow.hide().then(() => {
        invoke("mouse_click", getPosition(ref))!;
        reset();
      })!;
    }
  };
  const handleKey = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyQ":
        tauwin.appWindow.hide()!;
        reset();
        break;
      case "KeyH":
        hotkey(e.altKey, left);
        break;
      case "KeyJ":
        hotkey(e.altKey, bottom);
        break;
      case "KeyK":
        hotkey(e.altKey, top);
        break;
      case "KeyL":
        hotkey(e.altKey, right);
        break;
      case "KeyM": {
        invoke("move_mouse", getPosition(center))!;
        reset();
        tauwin.appWindow.hide()!;
        break;
      }
      case "KeyR":
        reset();
        break;
      case "Space": {
        hotkey(e.altKey, center);
        break;
      }
    }
  };
  onMount(() => {
    const shortcut = "CmdOrCtrl+Super+m";
    isRegistered(shortcut)
      .then((reg) => {
        if (reg) unregister(shortcut)!;
      })
      .finally(() => {
        register(shortcut, () => {
          tauwin.appWindow.show()!;
          tauwin.appWindow.setFocus()!;
        })!;
      })!;
    window.addEventListener("blur", blur);
    window.addEventListener("keydown", handleKey);
  });
  onCleanup(() => {
    window.removeEventListener("keydown", handleKey);
    window.removeEventListener("blur", blur);
  });
  return (
    <div
      class="absolute"
      style={{
        height: `${size.height.toString()}px`,
        width: `${size.width.toString()}px`,
        top: `${size.y.toString()}px`,
        left: `${size.x.toString()}px`,
      }}
    >
      <Region ref={top} height={false} show={show()} text="k" />
      <div class="flex h-1/2 w-full">
        <Region ref={left} height={true} show={show()} text="h" />
        <Region ref={center} height={true} show={true} text="" />
        <Region ref={right} height={true} show={show()} text="l" />
      </div>
      <Region ref={bottom} height={false} show={show()} text="j" />
    </div>
  );
}

export default App;
