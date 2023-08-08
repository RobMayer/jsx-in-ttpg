# JSX in TabletopPlayground

before:

```typescript
const image = new ImageWidget();
image.setTintColor([1, 1, 1, 0.75]);
image.setUrl("http://somewhere.com/image.png");

const element = new UIElement();
element.widget = image;

refObject.addUI(element);
```

after:

```tsx
const element = new UIElement();
render(<image url={"http://somewhere.com/image.png"} color={[1, 1, 1, 0.75]} />, element);
refObject.addUI(element);
```

# Setting up the JSX transformer.

For now, you'll need to use Typescript, and I'll assume that you're familiar enough with the basics of typescript to know things like what your tsconfig.json file is. If someone wants to make something that'll work with esbuild or what not, I welcome it.

You can also use `yarn create ttpg-package --template tsx` to get a new workspace with jsx-int-tpg set up already.

## changes to tsconfig.json

Add the "jsx" and "jsxFactory" fields to compilerOptions, and be sure to include "tsx" files to your tsc config. Files that use JSX need to have the file extension of "tsx".

```json
    {
        "compilerOptions" {
            "jsx": "react",
            "jsxFactory": "jsxInTTPG",
            "jsxFragmentFactory": "jsxFrag",
            /* ... other compilerOptions ... */
        },
        "include": ["./src/**/*.tsx", /* other includes */]
    },

```

additionally, you'll need to add this import at the top of any file that uses JSX

`import { jsxInTTPG } from "jsx-in-ttpg";`

## adding JSX to a UIElement or ScreenUIElement

use the provided `renderUI` function to add JSX to the UIElement/ScreenUIElement. The top-level JSX tag must be a vanilla widget (or a string or array string, since jsxInTTPG will wrap a lone string in a `<text>` widget automagically). This could also be a custom component, so long as any nested components resolve to a structure with a top-level widget.

```tsx
import { render, jsxInTTPG } from "jsx-in-ttpg";

const ui = new UIElement();
/* do stuff to set up ui element */

renderUI(<text>Hello There</text>, ui);
```

## Fragments

a custom component should always return a single JSXNode (or a primitive, null, etc, etc). If it turns out that you need to return multiple elements, wrap the returned elements in a fragment `<>{...}</>`. You will need to `import {jsxFrag} from 'jsx-in-ttpg'` to do so

```tsx
import { render, jsxInTTPG, jsxFrag } from "jsx-in-ttpg";

const MyComponent = () => {
    return (
        <>
            <horizontalbox>
                <text>Hello</text>
                <text>World</text>
            </horizontalbox>
            <horizontalbox>
                <richtext>Some fancy [b]bolded[/b] text</richtext>
            </horizontalbox>
        </>
    );
};

const ui = new UIElement();

renderUI(
    <layout>
        <verticalbox>
            <MyComponent />
        </verticalbox>
    </layout>,
    ui
);

refObject.addUI(ui);

/* note that renderUI returns the UIElement, so this could be further condensed like so, if you really want. */

refObject.addUI(
    renderUI(
        <layout>
            <verticalbox>
                <MyComponent />
            </verticalbox>
        </layout>,
        new UIElement()
    )
);
```

## setting a widget property directly

in instances where you need to set a new widget, or add a child, or if you want to mix-n-match JSX with vanilla TTPG elements, you need to make use of the provided `render()` function:

```tsx
const layoutBox = new LayoutBox();

layoutBox.setChild(render(<text>some text</text>));
```

this garauntees that the JSX will return a widget, and not some other value type like a primitive (render will actually wrap that in a `<text>` element, if that's the case).

# Syntax

Every Tabletop Playground widget is resprestented in a JSX intrinsic element with certain attributes that function as function calls or property setters for that widget.

-   Canvas: `<canvas>`
-   ImageWidget: `<image>`
-   ImageButton: `<imagebutton>`
-   ContentButton: `<contentbutton>`
-   Border: `<border>`
-   HorizontalBox: `<horizontalbox>`
-   VerticalBox: `<verticalbox>`
-   LayoutBox: `<layout>`
-   Text: `<text>`
-   Button: `<button>`
-   CheckBox: `<checkbox>`
-   MultilineTextBox: `<textarea>`
-   ProgressBar: `<progressbar>`
-   RichText: `<richtext>`
-   SelectionBox: `<select>`
-   Slider: `<slider>`
-   TextBox: `<input>`

## Attributes

several function calls, event handlers, or properties of TTPG widgets are available as attributes on the JSX element.

Note that boolean-type attributes don't require you to put the actual true/false value to have that value be "true" - for example `<button disabled>Some Text</button>` is equivilent to `<button disabled={true}>Some Text</button>`. (this is why certain properties are kind of the "inverse" of what you find in vanilla TTPG widget syntax, such as "disabled" vs "setEnabled" and "hidden" vs "setVisible")

### Common Attributes

-   `disabled` - `optional boolean` - equivilent to "setEnabled(!disabled)"
-   `hidden` - `optional boolean` - equivilent to "setVisible(!hidden)";
-   `ref` - `optional RefObject<T>` where T is the widget class being used - more on refs later.

#### ImageWidget

```tsx
<image onLoad={() => {}} color={[1, 1, 1, 1]} card={Card} url={"http://..."} src={"someimage.jpg"} package={"..."} />
```

-   `src` - `string`: Equivilent to calling `imageWidget.setImage(src)`
-   `srcPackage` - `string`: Equivilent to calling `imageWidget.setImage(src, srcPackage)` - you must provide the `src` attribute for the `srcPackage` attribute to have any effect.
-   `url` - `string`: Equivilent to calling `imagewidget.setUrl(...)` - mutually exclusive with `src` and `srcPackage` as well as `card`.
-   `card` - `Card`: Equivilent to calling `imageWidget.setSourceCard(...)` - mutually exclusive with `src` and `srcPackage` as well as `url`.
-   `onLoad` - `(image: ImageWidget, filename: string, packageId: string) => void`: Equivilent to calling `imagewidget.onImageLoaded.add(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivilent to calling `imagewidget.setTintColor(...)`.
-   `width` - `number`: Equivilent to calling `imagewidget.setWidth(...)`.
-   `height` - `number`: Equivilent to calling `imagewidget.setHeight(...)`.

-   `<image>` takes no children

#### ImageButton

```tsx
<imagebutton onLoad={() => {}} color={[1, 1, 1, 1]} card={Card} url={"http://..."} src={"someimage.jpg"} package={"..."} onClick={() => {}} />
```

-   `onClick`: Equivilent of `imageButton.onClicked.add(...)`
-   `src` - `string`: Equivilent to calling `imageWidget.setImage(src)`
-   `srcPackage` - `string`: Equivilent to calling `imageWidget.setImage(src, srcPackage)` - you must provide the `src` attribute for the `srcPackage` attribute to have any effect.
-   `url` - `string`: Equivilent to calling `imagewidget.setUrl(...)` - mutually exclusive with `src` and `srcPackage` as well as `card`.
-   `card` - `Card`: Equivilent to calling `imageWidget.setSourceCard(...)` - mutually exclusive with `src` and `srcPackage` as well as `url`.
-   `onLoad` - `(image: ImageWidget, filename: string, packageId: string) => void`: Equivilent to calling `imagewidget.onImageLoaded.add(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivilent to calling `imagewidget.setTintColor(...)`.
-   `width` - `number`: Equivilent to calling `imagewidget.setWidth(...)`.
-   `height` - `number`: Equivilent to calling `imagewidget.setHeight(...)`.

-   `<imagebutton>` takes no children

#### Border

```tsx
<border ref={borderRef} color={[1, 0, 0, 1]}>
    <text>"Hello, world!"</text>
</border>
```

-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `border.setColor(...)`.

-   `<border>` can take strings or a single widget as children.

#### Canvas

The canvas has no additional attributes. however, canvases take an atypical child function. You can have more than one. This is so you can set the x, y, width, and height inline.

```tsx
<canvas>
    {canvasChild({ x: 0, y: 0, width: 100, height: 100 }, <button>SomeText</button>)}
    {canvasChild({ x: 200, y: 0, width: 100, height: 100 }, <button>Some Other Text</button>)}
</canvas>
```

-   `<canvas>` can take multiple `canvasChild` calls as children. the second argument of canvasChild can be a string or a single widget.

### LayoutBox

```tsx
<layout halign={HorizontalAlignment.Center} valign={VerticalAlignment.Middle} padding={{ left: 10, right: 10, top: 5, bottom: 5 }}>
    <image src="avatar.jpg" />
</layout>
```

-   `valign` - `VerticalAlignment`: Equivalent to calling `layoutBox.setVerticalAlignment(...)`.
-   `halign` - `HorizontalAlignment`: Equivalent to calling `layoutBox.setHorizontalAlignment(...)`.
-   `padding` - `{ left?: number, right?: number, top?: number, bottom?: number }`: Equivalent to calling `layoutBox.setPadding(...)`.
-   `maxHeight` - `number`: Equivalent to calling `layoutBox.setMaximumHeight(...)`.
-   `minHeight` - `number`: Equivalent to calling `layoutBox.setMinimumHeight(...)`.
-   `height` - `number`: Equivalent to calling `layoutBox.setOverrideHeight(...)`.
-   `maxWidth` - `number`: Equivalent to calling `layoutBox.setMaximumWidth(...)`.
-   `minWidth` - `number`: Equivalent to calling `layoutBox.setMinimumWidth(...)`.
-   `width` - `number`: Equivalent to calling `layoutBox.setOverrideWidth(...)`.

-   `<layout>` can take strings or a single widget as children.

#### VerticalBox

VerticalBox (as well as the HorizontalBox) can take a special function child, much like Canvas. Unlike Canvas, however, it's not required. the first parameter of boxChild is the "weight" and the second is the Widget (or string) that will be that child.

```tsx
<verticalbox gap={10} halign={HorizontalAlignment.Left} valign={VerticalAlignment.Middle}>
    <text>"Hello!"</text>
    {boxChild(3, <button>Some Button</button>)}
    <image src="image1.jpg" />
</verticalbox>
```

-   `gap` - `number`: Equivalent to calling `verticalBox.setChildDistance(...)`.
-   `valign` - `VerticalAlignment`: Equivalent to calling `verticalBox.setVerticalAlignment(...)`.
-   `halign` - `HorizontalAlignment`: Equivalent to calling `verticalBox.setHorizontalAlignment(...)`.

-   `<verticalbox>` can take strings, any number of widgets, or the special {boxChild(1, <...>)} function.

#### HorizontalBox

```tsx
<horizontalbox ref={hboxRef} disabled={false} hidden={false} gap={10} halign={HorizontalAlignment.Left} valign={VerticalAlignment.Middle}>
    <image src="image1.jpg" />
    <text>"Hello!"</text>
</horizontalbox>
```

-   `gap` - `number`: Equivalent to calling `verticalBox.setChildDistance(...)`.
-   `valign` - `VerticalAlignment`: Equivalent to calling `verticalBox.setVerticalAlignment(...)`.
-   `halign` - `HorizontalAlignment`: Equivalent to calling `verticalBox.setHorizontalAlignment(...)`.

-   `<horizontalbox>`, like `<verticalbox>`, can take strings, any number of widgets, or the special {boxChild(1, <...>)} function.

#### ContentButton

```tsx
<contentbutton
    ref={buttonRef}
    disabled={false}
    hidden={false}
    onClick={(button, player) => {
        /* Click handler */
    }}
>
    <image src="button_icon.png" />
</contentbutton>
```

-   `onClick` - `(button: ContentButton, player: Player) => void`: Equivalent to adding a click event handler using `onClicked.add(...)`.

-   <contentbutton> can take strings or a single widget as children.

#### Text

```tsx
<text ref={textRef} disabled={false} hidden={false} bold={true} italic={false} size={18} color={[1, 0, 0, 1]} wrap={true} justify={TextJustification.Center}>
    Sample text content.
</text>
```

-   `bold` - `boolean`: Equivalent to calling `text.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `text.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `text.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `text.setTextColor(...)`.
-   `wrap` - `boolean`: Equivalent to calling `text.setAutoWrap(...)`.
-   `justify` - `TextJustification`: Equivalent to calling `text.setJustification(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<text>` obviously takes a string as a child

#### Button

```tsx
<button
    ref={buttonRef}
    disabled={false}
    hidden={false}
    bold={true}
    italic={false}
    size={18}
    color={[1, 0, 0, 1]}
    onClick={(button, player) => {
        /* Click handler */
    }}
>
    Click Me!
</button>
```

-   `bold` - `boolean`: Equivalent to calling `button.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `button.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `button.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `button.setTextColor(...)`.
-   `onClick` - `(button: Button, player: Player) => void`: Equivalent to adding a click event handler using `onClicked.add(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<button>` can take a string as a child

#### CheckBox

```tsx
<checkbox
    ref={checkboxRef}
    disabled={false}
    hidden={false}
    bold={true}
    italic={false}
    size={18}
    color={[1, 0, 0, 1]}
    onChange={(checkbox, player, state) => {
        /* Change handler */
    }}
    checked={true}
    label="Check me!"
/>
```

-   `bold` - `boolean`: Equivalent to calling `checkbox.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `checkbox.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `checkbox.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `checkbox.setTextColor(...)`.
-   `onChange` - `(checkbox: CheckBox, player: Player | undefined, state: boolean) => void`: Equivalent to adding a change event handler using `onCheckStateChanged.add(...)`.
-   `checked` - `boolean`: Equivalent to calling `checkbox.setIsChecked(...)`.
-   `label` - `string` or `string[]`: Equivalent to setting the checkbox label using `setText(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<checkbox>` takes no children

#### MultilineTextBox

```tsx
<textarea
    ref={textareaRef}
    disabled={false}
    hidden={false}
    bold={true}
    italic={false}
    size={18}
    color={[1, 0, 0, 1]}
    onChange={(element, player, text) => {
        /* Change handler */
    }}
    onCommit={(element, player, text) => {
        /* Commit handler */
    }}
    maxLength={100}
    transparent={false}
/>
```

-   `bold` - `boolean`: Equivalent to calling `multilineTextBox.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `multilineTextBox.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `multilineTextBox.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `multilineTextBox.setTextColor(...)`.
-   `onChange` - `(element: MultilineTextBox, player: Player | undefined, text: string) => void`: Equivalent to adding a change event handler using `onTextChanged.add(...)`.
-   `onCommit` - `(element: MultilineTextBox, player: Player | undefined, text: string) => void`: Equivalent to adding a commit event handler using `onTextCommitted.add(...)`.
-   `maxLength` - `number`: Equivalent to setting the maximum length of the text using `setMaxLength(...)`.
-   `transparent` - `boolean`: Equivalent to calling `multilineTextBox.setTransparent(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<textarea>` can take a string as a child

#### ProgressBar

```tsx
<progressbar ref={progressbarRef} disabled={false} hidden={false} bold={true} italic={false} wrap={true} size={18} color={[1, 0, 0, 1]} value={50} label="Loading..." />
```

-   `bold` - `boolean`: Equivalent to calling `progressBar.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `progressBar.setItalic(...)`.
-   `wrap` - `boolean`: Equivalent to calling `progressBar.setWrap(...)`.
-   `size` - `number`: Equivalent to calling `progressBar.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `progressBar.setTextColor(...)`.
-   `value` - `number`: Equivalent to calling `progressBar.setProgress(...)`.
-   `label` - `string` or `string[]`: Equivalent to setting the progress bar label using `setText(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<progressbar>` takes no children

#### RichText

```tsx
<richtext ref={richtextRef} disabled={false} hidden={false} bold={true} italic={false} size={18} color={[1, 0, 0, 1]} wrap={true} justify={TextJustification.Center}>
    This is a sample [b]rich[/b] text.
</richtext>
```

-   `bold` - `boolean`: Equivalent to calling `richText.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `richText.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `richText.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `richText.setTextColor(...)`.
-   `wrap` - `boolean`: Equivalent to calling `richText.setAutoWrap(...)`.
-   `justify` - `TextJustification`: Equivalent to calling `richText.setJustification(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<richtext>` can take a string as it's child.

#### SelectionBox (Select)

```tsx
<select
    ref={selectRef}
    disabled={false}
    hidden={false}
    bold={true}
    italic={false}
    size={18}
    color={[1, 0, 0, 1]}
    onChange={(element, player, index, option) => {
        /* Change handler */
    }}
    value="option2"
    options={["option1", "option2", "option3"]}
/>
```

-   `bold` - `boolean`: Equivalent to calling `selectionBox.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `selectionBox.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `selectionBox.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `selectionBox.setTextColor(...)`.
-   `onChange` - `(element: SelectionBox, player: Player | undefined, index: number, option: string) => void`: Equivalent to adding a change event handler using `onSelectionChanged.add(...)`.
-   `value` - `string`: Equivalent to setting the selected option using `setSelectedOption(...)`.
-   `options` - `string[]`: An array of available options for the selection box.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<select>` takes no children

#### Slider

```tsx
<slider
    ref={sliderRef}
    disabled={false}
    hidden={false}
    bold={true}
    italic={false}
    size={18}
    color={[1, 0, 0, 1]}
    min={0}
    value={50}
    max={100}
    step={1}
    onChange={(element, player, value) => {
        /* Change handler */
    }}
    inputWidth={50}
    font="Arial"
    fontPackage="main"
/>
```

-   `bold` - `boolean`: Equivalent to calling `slider.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `slider.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `slider.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `slider.setTextColor(...)`.
-   `min` - `number`: Equivalent to setting the minimum value using `setMinValue(...)`.
-   `value` - `number`: Equivalent to setting the current value using `setValue(...)`.
-   `max` - `number`: Equivalent to setting the maximum value using `setMaxValue(...)`.
-   `step` - `number`: Equivalent to setting the step size using `setStepSize(...)`.
-   `onChange` - `(element: Slider, player: Player | undefined, value: number) => void`: Equivalent to adding a change event handler using `onValueChanged.add(...)`.
-   `inputWidth` - `number`: Equivalent to setting the width of the input box using `setTextBoxWidth(...)`.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<slider>` takes no children

#### TextBox

```tsx
<input
    size={18}
    color={[1, 0, 0, 1]}
    onChange={(element, player, text) => {
        /* Change handler */
    }}
    onCommit={(element, player, text, hardCommit) => {
        /* Commit handler */
    }}
    maxLength={100}
    transparent={false}
    selectOnFocus={true}
    value="Initial Value"
    type="string"
    font="Arial"
    fontPackage="main"
/>
```

-   `bold` - `boolean`: Equivalent to calling `textBox.setBold(...)`.
-   `italic` - `boolean`: Equivalent to calling `textBox.setItalic(...)`.
-   `size` - `number`: Equivalent to calling `textBox.setFontSize(...)`.
-   `color` - `[number, number, number, number]` or `Color`: Equivalent to calling `textBox.setTextColor(...)`.
-   `onChange` - `(element: TextBox, player: Player | undefined, text: string) => void`: Equivalent to adding a change event handler using `onTextChanged.add(...)`.
-   `onCommit` - `(element: TextBox, player: Player | undefined, text: string, hardCommit: boolean) => void`: Equivalent to adding a commit event handler using `onTextCommitted.add(...)`.
-   `maxLength` - `number`: Equivalent to setting the maximum length of the text using `setMaxLength(...)`.
-   `transparent` - `boolean`: Equivalent to calling `textBox.setBackgroundTransparent(...)`.
-   `selectOnFocus` - `boolean`: Equivalent to calling `textBox.setSelectTextOnFocus(...)`.
-   `value` - `string`: Equivalent to setting the initial value using `setText(...)`.
-   `type` - `"string" | "float" | "positive-float" | "integer" | "positive-integer"`: Equivalent to setting the input type using `setInputType(...)` but with a string argument instead of numeric arguments.
-   `font` - `string`: Equivalent to setting the font using `setFont(...)`.
-   `fontPackage` - `string`: Equivalent to setting the font package using `setFont(...)` with a package specifier.

-   `<input>` takes no children

# Extendable Component-esque functions

You can make your own "components" that you can re-use throughout your code. I've re-used the same convention that React/Typescript uses: built-in widgets are all lowercase. Custom components must start with an Uppercase letter. Note the below: "RobPanel" vs "verticalbox".

```tsx
// RobPanel can be used anywhere I want this style of panel - with some forward thinking, it can be made more abstract and re-usable, if one wanted to.

const RobPanel = (props: { children?: SingleNode; title: TextNode; onClose?: () => void }) => {
    return (
        <border color={[0, 0, 0, 1]}>
            <verticalbox>
                <border color={[0.125, 0.125, 0.125, 1]}>
                    <horizontalbox valign={VerticalAlignment.Center}>
                        {boxChild(1, <text justify={TextJustification.Center}>{props.title}</text>)}
                        <button onClick={props.onClose}>Close</button>
                    </horizontalbox>
                </border>
                {boxChild(1, props.children)}
            </verticalbox>
        </border>
    );
};

const element = new UIElement();
render(<RobPanel title={"My Model"}>Hi There</RobPanel>, element);

refObject.addUI(element);
```

# Using Refs

JSX is only used to instantiate a widget. It does not take into account any changes you make to the widget inline through some state. For those who are familiar with JSX in the context of React or simiar, this will be jarring, no doubt. In order to programmatically access and alter a deeply nested widget, you can pass in a ref object into the ref attribute of an element.

To do this, call the provided `useRef()` function to generate a ref object. Once the widget has been instantiated, you can access the Widget directly using `refObj.current`. see the below.

if the widget hasn't been instantiated yet, the `ref.current` value will be `null`.

There is a trap here, however. It's important that if you are done with a certain widget, you clear the ref, otherwise the widget may not get properly garbage collected. To do this, call `refObj.clear()`. additionally, you can pass the same refObject to a new element to recyle it if you're no need a reference to the previous widget.

## Example with useRef

```tsx
const imageRef = useRef<ImageWidget>();
const layoutRef = useRef<LayoutBox>();

const checkRef = () => {
    console.log(imageRef.current);
    if (imageRef.current) {
        console.log(imageRef.current.getTintColor());
    }
};

render(
    <border color={[0, 0, 0, 1]}>
        <verticalbox margin={10}>
            <layout maxWidth={240}>
                <image ref={imageRef} url={"https://raw.githubusercontent.com/RobMayer/TTSLibrary/master/ads/offworldcolonies_h.jpg"} />
            </layout>
            <horizontalbox>
                <button onClick={checkRef}>Check</button>
            </horizontalbox>
        </verticalbox>
    </border>,
    element
);

refObject.addUI(element);
```

you can also just keep a reference to the widget the old-fashioned way, too, but I find it easier to keep the widget in the right place in the hierarchy rather than scattering discreet widgets around the script.

```tsx
const layoutRef = useRef<LayoutBox>();

const imageElement = <image url={"https://raw.githubusercontent.com/RobMayer/TTSLibrary/master/ads/offworldcolonies_h.jpg"} />;

const checkRef = () => {
    console.log(imageElement);
    console.log(imageElement.getTintColor());
};

render(
    <border color={[0, 0, 0, 1]}>
        <verticalbox margin={10}>
            <layout maxWidth={240}>{imageElement}</layout>
            <horizontalbox>
                <button onClick={checkRef}>Check</button>
            </horizontalbox>
        </verticalbox>
    </border>,
    element
);

refObject.addUI(element);
```
