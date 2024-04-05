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
    WebBrowser,
    WidgetSwitcher,
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

type IColor = Color | [number, number, number, number] | string;

const hexToColor = (h: string, pow: number = 1) => {
    h = h.slice(1);
    if (h.length === 3) {
        h = h + "f";
    }
    if (h.length === 4) {
        h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    if (h.length === 6) {
        h = h + "ff";
    }

    const r = Math.pow(parseInt(h.slice(0, 2), 16) / 255, pow);
    const g = Math.pow(parseInt(h.slice(2, 4), 16) / 255, pow);
    const b = Math.pow(parseInt(h.slice(4, 6), 16) / 255, pow);
    const a = Math.pow(parseInt(h.slice(6, 8), 16) / 255, pow);

    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
        return undefined;
    }
    return new Color(r, g, b, a);
};

const isColor = (c: any): c is Color => {
    return typeof c?.r === "number" && typeof c?.g === "number" && typeof c?.b === "number" && typeof c?.a === "number";
};

export const parseColor = (value: IColor) => {
    if (isColor(value)) {
        return value;
    }
    if (Array.isArray(value)) {
        if (value.length === 4) {
            return new Color(value[0], value[1], value[2], value[3]);
        }
        return undefined;
    }
    if (value.startsWith("#")) {
        return hexToColor(value);
    }
    if (value.startsWith("r")) {
        return hexToColor(value, 2.2);
    }
    return undefined;
};

export const useRef = <T>(initial: T | null = null): RefHandle<T> => {
    const ref = {
        current: initial,
        clear: () => {
            ref.current = null;
        },
    };
    return ref;
};

export const asTextNode = (children: JSXNode): TextNode => {
    if (!(children instanceof Widget)) {
        return children;
    }
    return undefined;
};

export const render = (children: JSXNode): Widget => {
    if (children instanceof Widget) {
        return children;
    }
    const t = new Text();
    t.setText(Array.isArray(children) ? children.filter((a) => typeof a === "string").join("") : `${typeof children === "string" || typeof children === "number" ? children : ""}`);
    return t;
};

type ArrayOr<T> = T | T[];

type RefValue<T> = { current: T | null } | ((o: T) => void);

export type JSXNode = JSX.Element;
export type RefHandle<T> = { current: T | null; clear: () => void };
export type RefObject<T> = { current: T | null };

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

export type JSXAttributes<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];

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
        case "browser":
            return browserElement(attrs as JSX.IntrinsicElements["browser"]);
        case "switch":
            return switchElement(attrs as JSX.IntrinsicElements["switch"], ensureWidgets(...children));
    }
};

const doCommon = <T extends Widget>(element: T, attrs: CommonElement<T>) => {
    element.setVisible(!attrs?.hidden);
    element.setEnabled(!attrs?.disabled);
    if (attrs.ref) {
        if (typeof attrs.ref === "function") {
            attrs.ref(element);
        } else {
            attrs.ref.current = element;
        }
    }
};

const doTextlike = <T extends TextWidgetBase>(element: T, attrs: TextlikeObject<T>) => {
    element.setVisible(!attrs?.hidden);
    element.setEnabled(!attrs?.disabled);
    if (attrs.ref) {
        if (typeof attrs.ref === "function") {
            attrs.ref(element);
        } else {
            attrs.ref.current = element;
        }
    }
    if (attrs.color) {
        const t = parseColor(attrs.color);
        if (t) {
            element.setTextColor(t);
        }
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
        if (typeof attrs.ref === "function") {
            attrs.ref(element);
        } else {
            attrs.ref.current = element;
        }
    }
    if (attrs.color) {
        const t = parseColor(attrs.color);
        if (t) {
            element.setTintColor(t);
        }
    }
    if ("url" in attrs && attrs.url) {
        element.setImageURL(attrs.url);
    }
    if ("src" in attrs && attrs.src) {
        if ("srcPackage" in attrs && attrs.srcPackage) {
            element.setImage(attrs.src, attrs.srcPackage);
        } else {
            element.setImage(attrs.src);
        }
    }
    if ("card" in attrs && attrs.card) {
        element.setSourceCard(attrs.card);
    }
    element.setImageSize(attrs?.width, attrs?.height);
};

type CommonElement<T extends Widget> = {
    ref?: RefValue<T>;
    disabled?: boolean;
    hidden?: boolean;
};

type TextlikeObject<T extends TextWidgetBase> = CommonElement<T> & {
    bold?: boolean;
    italic?: boolean;
    wrap?: boolean;
    size?: number;
    color?: IColor;
} & (
        | { font?: string }
        | {
              font: string;
              fontPackage?: string;
          }
    );

type ImagelikeObject<T extends ImageButton | ImageWidget> = CommonElement<T> & {
    color?: IColor;
    width?: number;
    height?: number;
} & (
        | { url?: string }
        | { card?: Card }
        | { src?: string }
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
    if (attrs.gap !== undefined) {
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
    if (attrs.gap !== undefined) {
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
        const t = parseColor(attrs.color);
        if (t) {
            element.setColor(t);
        }
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
        if (typeof attrs.padding === "number") {
            element.setPadding(attrs.padding, attrs.padding, attrs.padding, attrs.padding);
        } else {
            element.setPadding(attrs.padding.left, attrs.padding.right, attrs.padding.top, attrs.padding.bottom);
        }
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
    if (attrs.justify !== undefined) {
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
    if (attrs.justify !== undefined) {
        element.setJustification(attrs.justify);
    }
    if (children) {
        element.setText(children?.join(""));
    }
    return element;
};

const checkboxElement = (attrs: JSX.IntrinsicElements["checkbox"]) => {
    const element = new CheckBox();
    doTextlike(element, attrs);
    if (attrs.label !== undefined) {
        element.setText(Array.isArray(attrs.label) ? attrs.label.join("") : attrs.label);
    }
    if (attrs.onChange) {
        element.onCheckStateChanged.add((s, p, v) => {
            if (p !== undefined) {
                attrs.onChange?.(s, p, v);
            }
        });
    }
    if (attrs.onChangeActual) {
        element.onCheckStateChanged.add(attrs.onChangeActual);
    }
    if (attrs.transparent) {
        element.setBackgroundTransparent(true);
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
        element.onTextChanged.add((s, p, v) => {
            if (p !== undefined) {
                attrs.onChange?.(s, p, v);
            }
        });
    }
    if (attrs.onChangeActual) {
        element.onTextChanged.add(attrs.onChangeActual);
    }
    if (attrs.onCommit) {
        element.onTextCommitted.add((s, p, v) => {
            if (p !== undefined) {
                attrs.onCommit?.(s, p, v);
            }
        });
    }
    if (attrs.onCommitActual) {
        element.onTextCommitted.add(attrs.onCommitActual);
    }
    return element;
};

const progressbarElement = (attrs: JSX.IntrinsicElements["progressbar"]) => {
    const element = new ProgressBar();
    doTextlike(element, attrs);
    if (attrs.barColor) {
        const t = parseColor(attrs.barColor);
        if (t) {
            element.setBarColor(t);
        }
    }
    if (attrs.label) {
        element.setText(Array.isArray(attrs.label) ? attrs.label.join("") : attrs.label);
    }
    if (attrs.value !== undefined) {
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
    if (attrs.justify !== undefined) {
        element.setJustification(attrs.justify);
    }
    return element;
};

const selectElement = (attrs: JSX.IntrinsicElements["select"]) => {
    const element = new SelectionBox();
    doTextlike(element, attrs);
    element.setOptions(attrs.options);
    element.setSelectedOption(attrs.value ?? attrs.options[0] ?? "");
    if (attrs.onChange) {
        element.onSelectionChanged.add((s, p, i, v) => {
            if (p !== undefined) {
                attrs.onChange?.(s, p, i, v);
            }
        });
    }
    if (attrs.onChangeActual) {
        element.onSelectionChanged.add(attrs.onChangeActual);
    }
    return element;
};

const sliderElement = (attrs: JSX.IntrinsicElements["slider"]) => {
    const element = new Slider();
    doTextlike(element, attrs);
    if (attrs.onChange) {
        element.onValueChanged.add((s, p, v) => {
            if (p !== undefined) {
                attrs.onChange?.(s, p, v);
            }
        });
    }
    if (attrs.onChangeActual) {
        element.onValueChanged.add(attrs.onChangeActual);
    }
    element.setMinValue(attrs.min ?? 0);
    element.setMaxValue(attrs.max ?? 1);
    if (attrs.step !== undefined) {
        element.setStepSize(attrs.step);
    }
    if (attrs.inputWidth !== undefined) {
        element.setTextBoxWidth(attrs.inputWidth);
    }
    if (attrs.value !== undefined) {
        element.setValue(attrs.value);
    }
    return element;
};

const inputElement = (attrs: JSX.IntrinsicElements["input"]) => {
    const element = new TextBox();
    doTextlike(element, attrs);

    if (attrs.onChange) {
        element.onTextChanged.add((s, p, v) => {
            if (p !== undefined) {
                attrs.onChange?.(s, p, v);
            }
        });
    }
    if (attrs.onChangeActual) {
        element.onTextChanged.add(attrs.onChangeActual);
    }
    if (attrs.onCommit) {
        element.onTextCommitted.add((s, p, v, h) => {
            if (p !== undefined) {
                attrs.onCommit?.(s, p, v, h);
            }
        });
    }
    if (attrs.onCommitActual) {
        element.onTextCommitted.add(attrs.onCommitActual);
    }
    if (attrs.selectOnFocus) {
        element.setSelectTextOnFocus(attrs.selectOnFocus);
    }
    if (attrs.transparent) {
        element.setBackgroundTransparent(attrs.transparent);
    }
    if (attrs.maxLength !== undefined) {
        element.setMaxLength(attrs.maxLength);
    }
    if (attrs.value !== undefined) {
        element.setText(attrs.value);
    }
    if (attrs.type) {
        element.setInputType(INPUT_TYPES[attrs.type]);
    }
    return element;
};

const browserElement = (attrs: JSX.IntrinsicElements["browser"]) => {
    const element = new WebBrowser();
    doCommon(element, attrs);
    if (attrs.onChange) {
        element.onURLChanged.add(attrs.onChange);
    }
    if (attrs.onLoadFinish) {
        element.onLoadFinished.add(attrs.onLoadFinish);
    }
    if (attrs.onLoadStart) {
        element.onLoadStarted.add(attrs.onLoadStart);
    }
    if (attrs.url) {
        element.setURL(attrs.url);
    }
    return element;
};

const switchElement = (attrs: JSX.IntrinsicElements["switch"], children?: Widget[]) => {
    const element = new WidgetSwitcher();
    doCommon(element, attrs);
    if (children) {
        children.forEach((c) => element.addChild(c));
    }
    if (attrs.value) {
        if (attrs.value instanceof Widget) {
            element.setActiveWidget(attrs.value);
        } else {
            element.setActiveIndex(attrs.value);
        }
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
                ref?: RefValue<ImageWidget>;
                disabled?: boolean;
                hidden?: boolean;
                onLoad?: (image: ImageWidget, filename: string, packageId: string) => void;
                color?: IColor;
                width?: number;
                height?: number;
                children?: never;
            } & (
                | { url?: string }
                | { card?: Card }
                | {
                      src?: string;
                      srcPackage?: string;
                  }
            );
            imagebutton: {
                ref?: RefValue<ImageButton>;
                disabled?: boolean;
                hidden?: boolean;
                onLoad?: (image: ImageButton, filename: string, packageId: string) => void;
                color?: IColor;
                width?: number;
                height?: number;
                onClick?: (image: ImageButton, player: Player) => void;
                children?: never;
            } & (
                | { url?: string }
                | { card?: Card }
                | {
                      src?: string;
                      srcPackage?: string;
                  }
            );
            contentbutton: {
                ref?: RefValue<ContentButton>;
                disabled?: boolean;
                hidden?: boolean;
                onClick?: (image: ContentButton, player: Player) => void;
                children?: JSX.Element;
            };
            border: {
                ref?: RefValue<Border>;
                disabled?: boolean;
                hidden?: boolean;
                color?: IColor;
                children?: JSX.Element;
            };
            canvas: {
                ref?: RefValue<Canvas>;
                disabled?: boolean;
                hidden?: boolean;
                children?: ArrayOr<CanvasChild<JSX.Element>>;
            };
            horizontalbox: {
                ref?: RefValue<HorizontalBox>;
                disabled?: boolean;
                hidden?: boolean;
                gap?: number;
                valign?: VerticalAlignment;
                halign?: HorizontalAlignment;
                children?: ArrayOr<JSX.Element | BoxChild<JSX.Element>>;
            };
            verticalbox: {
                ref?: RefValue<VerticalBox>;
                disabled?: boolean;
                hidden?: boolean;
                gap?: number;
                valign?: VerticalAlignment;
                halign?: HorizontalAlignment;
                children?: ArrayOr<JSX.Element | BoxChild<JSX.Element>>;
            };
            layout: {
                ref?: RefValue<LayoutBox>;
                disabled?: boolean;
                hidden?: boolean;
                valign?: VerticalAlignment;
                halign?: HorizontalAlignment;
                padding?:
                    | number
                    | {
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
                ref?: RefValue<Text>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                wrap?: boolean;
                justify?: TextJustification;
                children?: TextNode;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            button: {
                ref?: RefValue<Button>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                onClick?: (button: Button, player: Player) => void;
                children?: TextNode;
                justify?: TextJustification;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            checkbox: {
                ref?: RefValue<CheckBox>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                transparent?: boolean;
                onChange?: (checkbox: CheckBox, player: Player, state: boolean) => void;
                onChangeActual?: (checkbox: CheckBox, player: Player | undefined, state: boolean) => void;
                checked?: boolean;
                label?: string | string[];
                children?: never;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            textarea: {
                ref?: RefValue<MultilineTextBox>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                onChange?: (element: MultilineTextBox, player: Player, text: string) => void;
                onChangeActual?: (element: MultilineTextBox, player: Player | undefined, text: string) => void;
                onCommit?: (element: MultilineTextBox, player: Player, text: string) => void;
                onCommitActual?: (element: MultilineTextBox, player: Player | undefined, text: string) => void;
                maxLength?: number;
                transparent?: boolean;
                children?: TextNode;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            progressbar: {
                ref?: RefValue<ProgressBar>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                wrap?: boolean;
                size?: number;
                color?: IColor;
                barColor?: IColor;
                value?: number;
                label?: string | string[];
                children?: never;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            richtext: {
                ref?: RefValue<RichText>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                wrap?: boolean;
                justify?: TextJustification;
                children?: TextNode;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            select: {
                ref?: RefValue<SelectionBox>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                onChange?: (element: SelectionBox, player: Player, index: number, option: string) => void;
                onChangeActual?: (element: SelectionBox, player: Player | undefined, index: number, option: string) => void;
                value?: string;
                options: string[];
                children?: never;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            slider: {
                ref?: RefValue<Slider>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                min?: number;
                value?: number;
                max?: number;
                step?: number;
                onChange?: (element: Slider, player: Player, value: number) => void;
                onChangeActual?: (element: Slider, player: Player | undefined, value: number) => void;
                inputWidth?: number;
                children?: never;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            input: {
                ref?: RefValue<TextBox>;
                disabled?: boolean;
                hidden?: boolean;
                bold?: boolean;
                italic?: boolean;
                size?: number;
                color?: IColor;
                onChange?: (element: TextBox, player: Player, text: string) => void;
                onChangeActual?: (element: TextBox, player: Player | undefined, text: string) => void;
                onCommit?: (element: TextBox, player: Player, text: string, hardCommit: boolean) => void;
                onCommitActual?: (element: TextBox, player: Player | undefined, text: string, hardCommit: boolean) => void;
                maxLength?: number;
                transparent?: boolean;
                selectOnFocus?: boolean;
                value?: string;
                type?: "string" | "float" | "positive-float" | "integer" | "positive-integer";
                children?: never;
            } & (
                | { font?: string }
                | {
                      font: string;
                      fontPackage?: string;
                  }
            );
            browser: {
                ref?: RefValue<WebBrowser>;
                disabled?: boolean;
                hidden?: boolean;
                onLoadStart?: (el: WebBrowser) => void;
                onLoadFinish?: (el: WebBrowser, success: boolean) => void;
                onChange?: (el: WebBrowser, url: string) => void;
                url?: string;
                children?: never;
            };
            switch: {
                ref?: RefValue<WidgetSwitcher>;
                disabled?: boolean;
                hidden?: boolean;
                children?: ArrayOr<JSX.Element>;
                value?: number | Widget;
            };
        }
    }
}
