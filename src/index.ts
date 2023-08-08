import {
    Text,
    Border,
    Canvas,
    ContentButton,
    HorizontalBox,
    ImageButton,
    ImageWidget,
    LayoutBox,
    VerticalBox,
    Widget,
    Button,
    CheckBox,
    TextWidgetBase,
    Color,
    Card,
    MultilineTextBox,
    ProgressBar,
    RichText,
    SelectionBox,
    Slider,
    TextBox,
    HorizontalAlignment,
    Player,
    TextJustification,
    VerticalAlignment,
    UIElement,
    ScreenUIElement,
} from "@tabletop-playground/api";

type CanvasChild<T> = {
    tag: "canvaschild";
    width: number;
    height: number;
    x: number;
    y: number;
    element: T | undefined;
};
type BoxChild<T> = {
    tag: "boxchild";
    element: T | undefined;
    weight?: number;
};

export const useRef = <T extends Widget>(initial: T | null = null): RefHandle<T> => {
    const ref = {
        current: initial,
        clear: () => {
            ref.current = null;
        },
    };
    return ref;
};

export const render = (widget: JSX.Element, element: UIElement | ScreenUIElement) => {
    if (!(widget instanceof Widget)) {
        throw Error("Top-level JSX.Element must be a widget");
    }
    element.widget = widget;
};

export const asTextNode = (children: JSXNode): TextNode => {
    if (!(children instanceof Widget)) {
        return children;
    }
    return undefined;
};

export const asWidget = (children: JSXNode): Widget => {
    if (children instanceof Widget) {
        return children;
    }
    const t = new Text();
    t.setText(Array.isArray(children) ? children.filter((a) => typeof a === "string").join("") : `${typeof children === "string" || typeof children === "number" ? children : ""}`);
    return t;
};

type ArrayOr<T> = T | T[];

export type JSXNode = JSX.Element;
export type RefHandle<T extends Widget> = { current: T | null; clear: () => void };
export type RefObject<T extends Widget> = { current: T | null };

type PossibleChildren = JSX.Element | ArrayOr<JSX.Element> | ArrayOr<BoxChild<JSX.Element>> | ArrayOr<CanvasChild<JSX.Element>> | TextNode;
export type TextNode = ArrayOr<string | undefined | null | boolean | number>;

export const boxChild = (weight: number, element: JSX.Element): BoxChild<JSX.Element> => {
    return {
        tag: "boxchild",
        weight,
        element,
    };
};

export const canvasChild = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }, element: JSX.Element): CanvasChild<JSX.Element> => {
    return {
        tag: "canvaschild",
        x,
        y,
        width,
        height,
        element,
    };
};

/* prettier-ignore */
export type JsxInTTPGElement<T extends Widget> = 
    T extends Canvas ? JSX.IntrinsicElements["canvas"] : 
    T extends ImageWidget ? JSX.IntrinsicElements["image"] : 
    T extends ImageButton ? JSX.IntrinsicElements["imagebutton"] : 
    T extends ContentButton ? JSX.IntrinsicElements["contentbutton"] : 
    T extends Border ? JSX.IntrinsicElements["border"] : 
    T extends HorizontalBox ? JSX.IntrinsicElements["horizontalbox"] : 
    T extends VerticalBox ? JSX.IntrinsicElements["verticalbox"] : 
    T extends LayoutBox ? JSX.IntrinsicElements["layout"] : 
    T extends Text ? JSX.IntrinsicElements["text"] : 
    T extends Button ? JSX.IntrinsicElements["button"] : 
    T extends CheckBox ? JSX.IntrinsicElements["checkbox"] : 
    T extends MultilineTextBox ? JSX.IntrinsicElements["textarea"] : 
    T extends ProgressBar ? JSX.IntrinsicElements["progressbar"] : 
    T extends RichText ? JSX.IntrinsicElements["richtext"] : 
    T extends SelectionBox ? JSX.IntrinsicElements["select"] : 
    T extends Slider ? JSX.IntrinsicElements["slider"] : 
    T extends TextBox ? JSX.IntrinsicElements["input"] : 
never;

const ensureWidgets = (...children: PossibleChildren[]): Widget[] => {
    return children.reduce<Widget[]>((acc, child) => {
        if (child === null || child === undefined || typeof child === "boolean") {
            return acc;
        }
        if (Array.isArray(child)) {
            acc.push(...ensureWidgets(...child));
        } else if (typeof child === "string" || typeof child === "number") {
            const element = new Text();
            element.setText(`${child}`);
            acc.push(element);
        } else if ("tag" in child) {
            if ("element" in child) {
                acc.push(...ensureWidgets(child.element));
            }
        } else {
            acc.push(child);
        }
        return acc;
    }, []);
};

const ensureCanvasChildren = (...children: PossibleChildren[]): CanvasChild<Widget>[] => {
    return children.reduce<CanvasChild<Widget>[]>((acc, child) => {
        if (child === null || child === undefined || typeof child === "boolean" || typeof child === "string" || typeof child === "number") {
            return acc;
        } else if (Array.isArray(child)) {
            acc.push(...ensureCanvasChildren(...child));
        } else if ("tag" in child && child.tag === "canvaschild") {
            acc.push({
                ...child,
                element: ensureWidgets(child)[0],
            });
        }
        return acc;
    }, []);
};

const ensureStrings = (...children: PossibleChildren[]): string[] => {
    return children.reduce<string[]>((acc, child) => {
        if (child === null || child === undefined || typeof child === "boolean") {
            return acc;
        } else if (Array.isArray(child)) {
            acc.push(...ensureStrings(...child));
        } else if (typeof child === "string" || typeof child === "number") {
            acc.push(`${child}`);
        }
        return acc;
    }, []);
};

const ensureBoxChildren = (children: PossibleChildren[]): (Widget | BoxChild<Widget>)[] => {
    return children.reduce<(Widget | BoxChild<Widget>)[]>((acc, child) => {
        if (child === null || child === undefined || typeof child === "boolean") {
            return acc;
        }
        if (Array.isArray(child)) {
            acc.push(...ensureWidgets(...child));
        } else if (typeof child === "string" || typeof child === "number") {
            const element = new Text();
            element.setText(`${child}`);
            acc.push(element);
        } else if ("tag" in child) {
            if (child.tag === "boxchild") {
                acc.push({
                    tag: child.tag,
                    element: ensureWidgets(child.element)[0],
                    weight: child.weight,
                });
            } else if ("element" in child) {
                const el = ensureWidgets(child.element)[0];
                if (el) {
                    acc.push(el);
                }
            }
        } else {
            acc.push(child);
        }
        return acc;
    }, []);
};

export const jsxInTTPG = (tag: ((props: any) => Widget) | keyof JSX.IntrinsicElements, props?: { [key: string]: any }, ...children: PossibleChildren[]): Widget | undefined => {
    props = props ?? {};

    if (typeof tag === "function") {
        return tag({ ...props, children });
    }
    const element = createElement(tag, props, children);
    return element;
};

export const jsxFrag = (props?: { [key: string]: any }, ...children: PossibleChildren[]): PossibleChildren | PossibleChildren[] => {
    if (children.length === 1) {
        return children[0];
    }
    return children;
};

const createElement = <const T extends keyof JSX.IntrinsicElements>(tag: T, attrs: { [key: string]: any }, children: PossibleChildren[]) => {
    switch (tag) {
        case "canvas":
            return canvasElement(attrs as JSX.IntrinsicElements["canvas"], ensureCanvasChildren(...children));
        case "border":
            return borderElement(attrs as JSX.IntrinsicElements["border"], ensureWidgets(...children)[0]);
        case "image":
            return imageElement(attrs as JSX.IntrinsicElements["image"]);
        case "imagebutton":
            return imageButtonElement(attrs as JSX.IntrinsicElements["imagebutton"]);
        case "horizontalbox":
            return hboxElement(attrs as JSX.IntrinsicElements["horizontalbox"], ensureBoxChildren(children));
        case "verticalbox":
            return vboxElement(attrs as JSX.IntrinsicElements["verticalbox"], ensureBoxChildren(children));
        case "layout":
            return layoutElement(attrs as JSX.IntrinsicElements["layout"], ensureWidgets(...children)[0]);
        case "contentbutton":
            return contentButtonElement(attrs as JSX.IntrinsicElements["contentbutton"], ensureWidgets(...children)[0]);
        case "text":
            return textElement(attrs as JSX.IntrinsicElements["text"], ensureStrings(...children));
        case "button":
            return buttonElement(attrs as JSX.IntrinsicElements["button"], ensureStrings(...children));
        case "checkbox":
            return checkboxElement(attrs as JSX.IntrinsicElements["checkbox"]);
        case "textarea":
            return textareaElement(attrs as JSX.IntrinsicElements["textarea"], ensureStrings(...children));
        case "progressbar":
            return progressbarElement(attrs as JSX.IntrinsicElements["progressbar"]);
        case "richtext":
            return richtextElement(attrs as JSX.IntrinsicElements["richtext"], ensureStrings(...children));
        case "select":
            return selectElement(attrs as JSX.IntrinsicElements["select"]);
        case "slider":
            return sliderElement(attrs as JSX.IntrinsicElements["slider"]);
        case "input":
            return inputElement(attrs as JSX.IntrinsicElements["input"]);
    }
};

const doCommon = <T extends Widget>(element: T, attrs: CommonElement<T>) => {
    element.setVisible(!attrs?.hidden);
    element.setEnabled(!attrs?.disabled);
    if (attrs.ref) {
        attrs.ref.current = element;
    }
};

const doTextlike = <T extends TextWidgetBase>(element: T, attrs: TextlikeObject<T>) => {
    element.setVisible(!attrs?.hidden);
    element.setEnabled(!attrs?.disabled);
    if (attrs.ref) {
        attrs.ref.current = element;
    }
    if (attrs.color) {
        element.setTextColor(attrs.color);
    }
    element.setBold(!!attrs.bold);
    element.setItalic(!!attrs.italic);
    if (attrs.size) {
        element.setFontSize(attrs.size);
    }
    if (attrs.font) {
        if ("fontPackage" in attrs) {
            element.setFont(attrs.font, attrs.fontPackage);
        } else {
            element.setFont(attrs.font);
        }
    }
};

const doImagelike = <T extends ImageButton | ImageWidget>(element: T, attrs: ImagelikeObject<T>) => {
    element.setVisible(!attrs?.hidden);
    element.setEnabled(!attrs?.disabled);
    if (attrs.ref) {
        attrs.ref.current = element;
    }
    if (attrs.color) {
        element.setTintColor(attrs.color);
    }
    if ("url" in attrs) {
        element.setImageURL(attrs.url);
    }
    if ("src" in attrs) {
        element.setImage(attrs.src, attrs.srcPackage);
    }
    if ("card" in attrs) {
        element.setSourceCard(attrs.card);
    }
    element.setImageSize(attrs?.width ?? 0, attrs?.height ?? 0);
};

type CommonElement<T extends Widget> = {
    ref?: RefObject<T>;
    disabled?: boolean;
    hidden?: boolean;
};

type TextlikeObject<T extends TextWidgetBase> = CommonElement<T> & {
    bold?: boolean;
    italic?: boolean;
    wrap?: boolean;
    size?: number;
    color?: Color | [number, number, number, number];
} & (
        | {
              font?: string;
          }
        | {
              font: string;
              fontPackage?: string;
          }
    );

type ImagelikeObject<T extends ImageButton | ImageWidget> = CommonElement<T> & {
    color?: Color | [number, number, number, number];
    width?: number;
    height?: number;
} & (
        | { url: string }
        | {
              card: Card;
          }
        | {
              src: string;
              srcPackage?: string;
          }
    );

const imageElement = (attrs: JSX.IntrinsicElements["image"]) => {
    const element = new ImageWidget();
    doImagelike(element, attrs);
    if (attrs.onLoad) {
        element.onImageLoaded.add(attrs.onLoad);
    }
    return element;
};

const imageButtonElement = (attrs: JSX.IntrinsicElements["imagebutton"]) => {
    const element = new ImageButton();
    doImagelike(element, attrs);
    if (attrs.onLoad) {
        element.onImageLoaded.add(attrs.onLoad);
    }
    if (attrs.onClick) {
        element.onClicked.add(attrs.onClick);
    }
    return element;
};

const canvasElement = (attrs: JSX.IntrinsicElements["canvas"], children: CanvasChild<Widget>[]) => {
    const element = new Canvas();
    doCommon(element, attrs);
    children.forEach((child) => {
        if (child.element) {
            element.addChild(child.element, child.x, child.y, child.width, child.height);
        }
    });
    return element;
};

const hboxElement = (attrs: JSX.IntrinsicElements["horizontalbox"], children: (BoxChild<Widget> | Widget)[]) => {
    const element = new HorizontalBox();
    doCommon(element, attrs);
    if (attrs.gap) {
        element.setChildDistance(attrs.gap);
    }
    if (attrs.halign) {
        element.setHorizontalAlignment(attrs.halign);
    }
    if (attrs.valign) {
        element.setVerticalAlignment(attrs.valign);
    }
    children.forEach((child) => {
        if ("tag" in child) {
            if (child.element) {
                element.addChild(child.element, child.weight);
            }
        } else {
            element.addChild(child);
        }
    });
    return element;
};

const vboxElement = (attrs: JSX.IntrinsicElements["verticalbox"], children: (BoxChild<Widget> | Widget)[]) => {
    const element = new VerticalBox();
    doCommon(element, attrs);
    if (attrs.gap) {
        element.setChildDistance(attrs.gap);
    }
    if (attrs.halign) {
        element.setHorizontalAlignment(attrs.halign);
    }
    if (attrs.valign) {
        element.setVerticalAlignment(attrs.valign);
    }
    children.forEach((child) => {
        if ("tag" in child) {
            if (child.element) {
                element.addChild(child.element, child.weight);
            }
        } else {
            element.addChild(child);
        }
    });
    return element;
};

const borderElement = (attrs: JSX.IntrinsicElements["border"], child?: Widget) => {
    const element = new Border();
    doCommon(element, attrs);
    if (attrs.color) {
        element.setColor(attrs.color);
    }
    if (child) {
        element.setChild(child);
    }
    return element;
};

const layoutElement = (attrs: JSX.IntrinsicElements["layout"], child?: Widget) => {
    const element = new LayoutBox();
    doCommon(element, attrs);
    if (child) {
        element.setChild(child);
    }
    if (attrs.padding) {
        element.setPadding(attrs.padding.left, attrs.padding.right, attrs.padding.top, attrs.padding.bottom);
    }
    if (attrs.halign) {
        element.setHorizontalAlignment(attrs.halign);
    }
    if (attrs.valign) {
        element.setVerticalAlignment(attrs.valign);
    }
    if (attrs.minWidth) {
        element.setMinimumWidth(attrs.minWidth);
    }
    if (attrs.maxWidth) {
        element.setMaximumWidth(attrs.maxWidth);
    }
    if (attrs.width) {
        element.setOverrideWidth(attrs.width);
    }
    if (attrs.minHeight) {
        element.setMinimumHeight(attrs.minHeight);
    }
    if (attrs.maxHeight) {
        element.setMaximumHeight(attrs.maxHeight);
    }
    if (attrs.height) {
        element.setOverrideHeight(attrs.height);
    }
    return element;
};

const contentButtonElement = (attrs: JSX.IntrinsicElements["contentbutton"], child?: Widget) => {
    const element = new ContentButton();
    doCommon(element, attrs);
    if (attrs.onClick) {
        element.onClicked.add(attrs.onClick);
    }
    if (child) {
        element.setChild(child);
    }
    return element;
};

const textElement = (attrs: JSX.IntrinsicElements["text"], children?: string[]) => {
    const element = new Text();
    doTextlike(element, attrs);
    if (children) {
        element.setText(children?.join(""));
    }
    element.setAutoWrap(!!attrs.wrap);
    if (attrs.justify) {
        element.setJustification(attrs.justify);
    }
    return element;
};

const buttonElement = (attrs: JSX.IntrinsicElements["button"], children?: string[]) => {
    const element = new Button();
    doTextlike(element, attrs);
    if (attrs.onClick) {
        element.onClicked.add(attrs.onClick);
    }
    if (children) {
        element.setText(children?.join(""));
    }
    return element;
};

const checkboxElement = (attrs: JSX.IntrinsicElements["checkbox"]) => {
    const element = new CheckBox();
    doTextlike(element, attrs);
    if (attrs.label) {
        element.setText(Array.isArray(attrs.label) ? attrs.label.join("") : attrs.label);
    }
    if (attrs.onChange) {
        element.onCheckStateChanged.add(attrs.onChange);
    }
    element.setIsChecked(!!attrs.checked);
    return element;
};

const textareaElement = (attrs: JSX.IntrinsicElements["textarea"], children?: string[]) => {
    const element = new MultilineTextBox();
    doTextlike(element, attrs);
    if (children) {
        element.setText(children?.join(""));
    }
    if (attrs.onChange) {
        element.onTextChanged.add(attrs.onChange);
    }
    if (attrs.onCommit) {
        element.onTextCommitted.add(attrs.onCommit);
    }
    return element;
};

const progressbarElement = (attrs: JSX.IntrinsicElements["progressbar"]) => {
    const element = new ProgressBar();
    doTextlike(element, attrs);
    if (attrs.label) {
        element.setText(Array.isArray(attrs.label) ? attrs.label.join("") : attrs.label);
    }
    if (attrs.value) {
        element.setProgress(attrs.value);
    }
    return element;
};

const richtextElement = (attrs: JSX.IntrinsicElements["richtext"], children?: string[]) => {
    const element = new RichText();
    doTextlike(element, attrs);
    if (children) {
        element.setText(children?.join("\n"));
    }
    element.setAutoWrap(!!attrs.wrap);
    if (attrs.justify) {
        element.setJustification(attrs.justify);
    }
    return element;
};

const selectElement = (attrs: JSX.IntrinsicElements["select"]) => {
    const element = new SelectionBox();
    doTextlike(element, attrs);
    element.setOptions(attrs.options);
    if (attrs.value) {
        element.setSelectedOption(attrs.value);
    }
    if (attrs.onChange) {
        element.onSelectionChanged.add(attrs.onChange);
    }
    return element;
};

const sliderElement = (attrs: JSX.IntrinsicElements["slider"]) => {
    const element = new Slider();
    doTextlike(element, attrs);
    if (attrs.onChange) {
        element.onValueChanged.add(attrs.onChange);
    }
    if (attrs.min) {
        element.setMinValue(attrs.min);
    }
    if (attrs.max) {
        element.setMaxValue(attrs.max);
    }
    if (attrs.step) {
        element.setStepSize(attrs.step);
    }
    if (attrs.inputWidth) {
        element.setTextBoxWidth(attrs.inputWidth);
    }
    if (attrs.value) {
        element.setValue(attrs.value);
    }
    return element;
};

const inputElement = (attrs: JSX.IntrinsicElements["input"]) => {
    const element = new TextBox();
    doTextlike(element, attrs);
    if (attrs.onChange) {
        element.onTextChanged.add(attrs.onChange);
    }
    if (attrs.onCommit) {
        element.onTextCommitted.add(attrs.onCommit);
    }
    if (attrs.selectOnFocus) {
        element.setSelectTextOnFocus(attrs.selectOnFocus);
    }
    if (attrs.transparent) {
        element.setBackgroundTransparent(attrs.transparent);
    }
    if (attrs.maxLength) {
        element.setMaxLength(attrs.maxLength);
    }
    if (attrs.value) {
        element.setText(attrs.value);
    }
    if (attrs.type) {
        element.setInputType(INPUT_TYPES[attrs.type]);
    }
    return element;
};

const INPUT_TYPES = {
    string: 0,
    float: 1,
    "positive-float": 2,
    integer: 3,
    "positive-integer": 4,
};

declare global {
    namespace JSX {
        type Element = Widget | ArrayOr<string | undefined | null | boolean | number>;
        interface ElementChildrenAttribute {
            children: {};
        }

        interface IntrinsicElements {
            image: {
                ref?: { current: ImageWidget | null };
                disabled?: boolean;
                hidden?: boolean;
                onLoad?: (image: ImageWidget, filename: string, packageId: string) => void;
                color?: Color | [number, number, number, number];
                width?: number;
                height?: number;
                children?: never;
            } & (
                | { url: string }
                | {
                      card: Card;
                  }
                | {
                      src: string;
                      srcPackage?: string;
                  }
            );
            imagebutton: {
                ref?: { current: ImageButton | null };
                disabled?: boolean;
                hidden?: boolean;
                onLoad?: (image: ImageButton, filename: string, packageId: string) => void;
                color?: Color | [number, number, number, number];
                width?: number;
                height?: number;
                onClick?: (image: ImageButton, player: Player) => void;
                children?: never;
            } & (
                | { url: string }
                | {
                      card: Card;
                  }
                | {
                      src: string;
                      srcPackage?: string;
                  }
            );
            contentbutton: {
                ref?: { current: ContentButton | null };
                disabled?: boolean;
                hidden?: boolean;
                onClick?: (image: ContentButton, player: Player) => void;
                children?: JSX.Element;
            };
            border: {
                ref?: { current: Border | null };
                disabled?: boolean;
                hidden?: boolean;
                color?: Color | [number, number, number, number];
                children?: JSX.Element;
            };
            canvas: {
                ref?: { current: Canvas | null };
                disabled?: boolean;
                hidden?: boolean;
                children?: ArrayOr<CanvasChild<JSX.Element>>;
            };
            horizontalbox: {
                ref?: { current: HorizontalBox | null };
                disabled?: boolean;
                hidden?: boolean;
                gap?: number;
                valign?: VerticalAlignment;
                halign?: HorizontalAlignment;
                children?: ArrayOr<JSX.Element | BoxChild<JSX.Element>>;
            };
            verticalbox: {
                ref?: { current: VerticalBox | null };
                disabled?: boolean;
                hidden?: boolean;
                gap?: number;
                valign?: VerticalAlignment;
                halign?: HorizontalAlignment;
                children?: ArrayOr<JSX.Element | BoxChild<JSX.Element>>;
            };
            layout: {
                ref?: { current: LayoutBox | null };
                disabled?: boolean;
                hidden?: boolean;
                valign?: VerticalAlignment;
                halign?: HorizontalAlignment;
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
                children?: JSX.Element;
            };
            text: {
                ref?: { current: Text | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                wrap?: boolean;
                justify?: TextJustification;
                children?: TextNode;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            button: {
                ref?: { current: Button | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                onClick?: (button: Button, player: Player) => void;
                children?: TextNode;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            checkbox: {
                ref?: { current: CheckBox | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                onChange?: (checkbox: CheckBox, player: Player | undefined, state: boolean) => void;
                checked?: boolean;
                label?: string | string[];
                children?: never;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            textarea: {
                ref?: { current: MultilineTextBox | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                onChange?: (element: MultilineTextBox, player: Player | undefined, text: string) => void;
                onCommit?: (element: MultilineTextBox, player: Player | undefined, text: string) => void;
                maxLength?: number;
                transparent?: boolean;
                children?: TextNode;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            progressbar: {
                ref?: { current: ProgressBar | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                wrap?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                value?: number;
                label?: string | string[];
                children?: never;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            richtext: {
                ref?: { current: RichText | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                wrap?: boolean;
                justify?: TextJustification;
                children?: TextNode;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            select: {
                ref?: { current: SelectionBox | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                onChange?: (element: SelectionBox, player: Player | undefined, index: number, option: string) => void;
                value?: string;
                options: string[];
                children?: never;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            slider: {
                ref?: { current: Slider | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                min?: number;
                value?: number;
                max?: number;
                step?: number;
                onChange?: (element: Slider, player: Player | undefined, value: number) => void;
                inputWidth?: number;
                children?: never;
            } & (
                | {
                      font?: string;
                  }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            input: {
                ref?: { current: TextBox | null };
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: Color | [number, number, number, number];
                onChange?: (element: TextBox, player: Player | undefined, text: string) => void;
                onCommit?: (element: TextBox, player: Player | undefined, text: string, hardCommit: boolean) => void;
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
                      fontPackage?: string;
                  }
            );
        }
    }
}
