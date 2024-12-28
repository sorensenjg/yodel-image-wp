import { useRef } from "react";
import {
  getEditorDefaults,
  findNode,
  createNode,
  appendNode,
  removeNode,
} from "@pqina/pintura";
import { PinturaEditor } from "@pqina/react-pintura";
import "@pqina/pintura/pintura.css";

const defaultConfig = getEditorDefaults();

const editorConfig = {
  ...defaultConfig,
  utils: ["crop", "filter", "finetune", "annotate", "redact", "resize"],
  enableCanvasAlpha: true,
  cropSelectPresetFilter: "landscape",
  cropSelectPresetOptions: [
    [undefined, "Custom"],
    [1, "1:1"],

    [2 / 1, "2:1"],
    [3 / 2, "3:2"],
    [4 / 3, "4:3"],
    [16 / 9, "16:9"],
    [16 / 10, "16:10"],

    [1 / 2, "1:2"],
    [2 / 3, "2:3"],
    [3 / 4, "3:4"],
    [9 / 16, "9:16"],
    [10 / 16, "10:16"],
  ],
} as any;

export function Editor(props: any) {
  const editorRef = useRef<any>(null);

  const willRenderToolbar = (toolbar: any) => {
    const saveButton = findNode("export", toolbar)!;
    if (saveButton) {
      saveButton[2] = {
        ...saveButton[2],
        label: "Save",
        class: "button button--primary save-button",
      };
    }

    const cancelButton = createNode("Button", "cancel", {
      label: "Cancel",
      class: "button button--outline",
      onclick: () => {
        props.imageEdit.close(props.post.id);
      },
    });

    const gammaGroup = findNode("gamma", toolbar)!;
    const gammaSet = createNode(
      "div",
      "gamma-set",
      { class: "PinturaNavSet" },
      [cancelButton, saveButton]
    );
    appendNode(gammaSet, gammaGroup);

    // remove the original export button
    removeNode("export", gammaGroup);

    // find the group of buttons to add our custom button to
    // const buttonGroup = findNode("alpha-set", toolbar)!;

    // // create a custom button
    // const removeBackgroundButton = createNode(
    //   "Button",
    //   "remove-background-button",
    //   {
    //     label: "Remove background",
    //     onclick: async () => {
    //       if (!editorRef.current) return;

    //       // disable input
    //       editorRef.current.editor.disabled = true;

    //       // now loading
    //       editorRef.current.editor.status = "Uploading data…";

    //       // post image to background removal service
    //       const formData = new FormData();
    //       formData.append(
    //         "image",
    //         editorRef.current.editor.imageFile,
    //         editorRef.current.editor.imageFile.name
    //       );

    //       // request removal of background
    //       const newImage = fetch("remove-the-background", {
    //         method: "POST",
    //         body: formData,
    //       }).then((res) => res.blob());

    //       // done loading
    //       editorRef.current.editor.status = undefined;

    //       // update the image with the newly received transparent image
    //       editorRef.current.editor.updateImage(newImage);
    //     },
    //   }
    // );

    // // add the button to the toolbar
    // appendNode(removeBackgroundButton, buttonGroup);

    // clone the toolbar array when returning to Pintura
    return [...toolbar];
  };

  // console.log(props);

  return (
    <PinturaEditor
      ref={editorRef}
      {...editorConfig}
      willRenderToolbar={willRenderToolbar}
      src={props.post.url}
      {...props}
    />
  );
}
