declare namespace JSX {
    type Element = import("@tabletop-playground/api").Widget;
    interface ElementChildrenAttribute {
        children: {};
    }

    interface IntrinsicElements {
        image: {
            ref?: { current: import("@tabletop-playground/api").ImageWidget | null };
            disabled?: boolean;
            hidden?: boolean;
            onLoad?: (image: import("@tabletop-playground/api").ImageWidget, filename: string, packageId: string) => void;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            width?: number;
            height?: number;
            children?: never;
        } & (
            | { url: string }
            | {
                  card: import("@tabletop-playground/api").Card;
              }
            | {
                  image: string;
                  package?: string;
              }
        );
        imagebutton: {
            ref?: { current: import("@tabletop-playground/api").ImageButton | null };
            disabled?: boolean;
            hidden?: boolean;
            onLoad?: (image: import("@tabletop-playground/api").ImageButton, filename: string, packageId: string) => void;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            width?: number;
            height?: number;
            onClick?: (image: import("@tabletop-playground/api").ImageButton, player: import("@tabletop-playground/api").Player) => void;
            children?: never;
        } & (
            | { url: string }
            | {
                  card: import("@tabletop-playground/api").Card;
              }
            | {
                  image: string;
                  package?: string;
              }
        );
        contentbutton: {
            ref?: { current: import("@tabletop-playground/api").ContentButton | null };
            disabled?: boolean;
            hidden?: boolean;
            onClick?: (image: import("@tabletop-playground/api").ContentButton, player: import("@tabletop-playground/api").Player) => void;
            children?: import(".").SingleNode;
        };
        border: {
            ref?: { current: import("@tabletop-playground/api").Border | null };
            disabled?: boolean;
            hidden?: boolean;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            children?: import(".").SingleNode;
        };
        canvas: {
            ref?: { current: import("@tabletop-playground/api").Canvas | null };
            disabled?: boolean;
            hidden?: boolean;
            children?: import(".").CanvasNode;
        };
        horizontalbox: {
            ref?: { current: import("@tabletop-playground/api").HorizontalBox | null };
            disabled?: boolean;
            hidden?: boolean;
            margin?: number;
            valign?: import("@tabletop-playground/api").VerticalAlignment;
            halign?: import("@tabletop-playground/api").HorizontalAlignment;
            children?: import(".").BoxNode;
        };
        verticalbox: {
            ref?: { current: import("@tabletop-playground/api").VerticalBox | null };
            disabled?: boolean;
            hidden?: boolean;
            margin?: number;
            valign?: import("@tabletop-playground/api").VerticalAlignment;
            halign?: import("@tabletop-playground/api").HorizontalAlignment;
            children?: import(".").BoxNode;
        };
        layout: {
            ref?: { current: import("@tabletop-playground/api").LayoutBox | null };
            disabled?: boolean;
            hidden?: boolean;
            valign?: import("@tabletop-playground/api").VerticalAlignment;
            halign?: import("@tabletop-playground/api").HorizontalAlignment;
            padding?: {
                left?: number;
                right?: number;
                top?: number;
                bottom?: number;
            };
            maxHeight?: number;
            minHeight?: number;
            height?: number;
            minWidth?: number;
            maxWidth?: number;
            width?: number;
            children?: import(".").SingleNode;
        };
        text: {
            ref?: { current: import("@tabletop-playground/api").Text | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            wrap?: boolean;
            justify?: import("@tabletop-playground/api").TextJustification;
            children?: import(".").TextNode;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        button: {
            ref?: { current: import("@tabletop-playground/api").Button | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            onClick?: (button: import("@tabletop-playground/api").Button, player: import("@tabletop-playground/api").Player) => void;
            children?: import(".").TextNode;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        checkbox: {
            ref?: { current: import("@tabletop-playground/api").CheckBox | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            onChange?: (checkbox: import("@tabletop-playground/api").CheckBox, player: import("@tabletop-playground/api").Player | undefined, state: boolean) => void;
            checked?: boolean;
            label?: string | string[];
            children?: never;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        textarea: {
            ref?: { current: import("@tabletop-playground/api").MultilineTextBox | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            onChange?: (element: import("@tabletop-playground/api").MultilineTextBox, player: import("@tabletop-playground/api").Player | undefined, text: string) => void;
            onCommit?: (element: import("@tabletop-playground/api").MultilineTextBox, player: import("@tabletop-playground/api").Player | undefined, text: string) => void;
            maxLength?: number;
            transparent?: boolean;
            children?: import(".").TextNode;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        progressbar: {
            ref?: { current: import("@tabletop-playground/api").ProgressBar | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            wrap?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            value?: number;
            label?: string | string[];
            children?: never;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        richtext: {
            ref?: { current: import("@tabletop-playground/api").RichText | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            wrap?: boolean;
            justify?: import("@tabletop-playground/api").TextJustification;
            children?: import(".").TextNode;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        select: {
            ref?: { current: import("@tabletop-playground/api").SelectionBox | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            onChange?: (element: import("@tabletop-playground/api").SelectionBox, player: import("@tabletop-playground/api").Player | undefined, index: number, option: string) => void;
            value?: string;
            options: string[];
            children?: never;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        slider: {
            ref?: { current: import("@tabletop-playground/api").Slider | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            min?: number;
            value?: number;
            max?: number;
            step?: number;
            onChange?: (element: import("@tabletop-playground/api").Slider, player: import("@tabletop-playground/api").Player | undefined, value: number) => void;
            inputWidth?: number;
            children?: never;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
        input: {
            ref?: { current: import("@tabletop-playground/api").TextBox | null };
            disabled?: boolean;
            hidden?: boolean;
            bold?: boolean;
            italic?: boolean;
            size?: number;
            color?: import("@tabletop-playground/api").Color | [number, number, number, number];
            onChange?: (element: import("@tabletop-playground/api").TextBox, player: import("@tabletop-playground/api").Player | undefined, text: string) => void;
            onCommit?: (element: import("@tabletop-playground/api").TextBox, player: import("@tabletop-playground/api").Player | undefined, text: string, hardCommit: boolean) => void;
            maxLength?: number;
            transparent?: boolean;
            selectOnFocus?: boolean;
            value?: string;
            type?: "string" | "float" | "positive-float" | "integer" | "positive-integer";
            children?: never;
        } & (
            | {
                  font?: string;
              }
            | {
                  font: string;
                  package?: string;
              }
        );
    }
}

// type TextlikeObject<T extends import("@tabletop-playground/api").TextWidgetBase> = CommonElement<T> & {
//     ref?: { current: T | null };
//     disabled?: boolean;
//     hidden?: boolean;
//     bold?: boolean;
//     italic?: boolean;
//     wrap?: boolean;
//     size?: number;
//     color?: import("@tabletop-playground/api").Color | [number, number, number, number];
// } & (
//         | {
//               font?: string;
//           }
//         | {
//               font: string;
//               package?: string;
//           }
//     );
