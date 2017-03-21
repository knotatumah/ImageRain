# Image Rain

[What is Image Rain?](#whatIs)
[Can I Contribute?](#contribute)
[Using Image Rain](#install)
[Parameters](#parameters)

## <a name="whatIs"></a> What is Image Rain?

Image Rain is a small forever project of mine inspired by Matrix rain, scrolling columns of icons over the top of an image in a Matrix rain fashion. It takes any background image and uses just about any sprite sheet with square sprites (equal width & height dimensions.)

## <a name="contribute"></a> Can I Contribute?

Absolutely! I did this project as a learning experience and I would love to get feedback and help from others to make the project better.

## <a name="install"></a> Using Image Rain

Include imageRain.css and imageRain.js or imageRain.es2015.min.js to target older browsers (namely any version of IE that is not Edge.)

Initialize Image Rain by invoking ImageRain:
var = new ImageRain( { parameters } );

## <a name="parameters"></a> Parameters

**container** [string] **required*
The id of the element to put the canvases.

**backgroundUrl** [string] **required*
The url of the background image.

**spritesUrl** [string] **required*
The url of the sprite sheet to be used.

**spriteFrameScale** [integer] **required*
The pixel dimension of the sprite, currently square-only. (12x12, 32x32, etc..)

**scale** [integer] *(default: 16)*
How wide (in pixels) should the columns be.
*Note: May impact cpu performance at lower numbers, i.e. 1 pixel.*

**fade** [float] *(default: 0.5)*
0 to 1, how opaque the columns will be.

**fadeCount** [integer] *(default: 6)*
How many steps to reach maximum background color; or, how long the fade trail will be.

**minSpeed** [integer] *(default: 5)*
Minimum speed (in frames) that the column will attempt to update. Higher = slower speed.

**maxSpeed** [integer] *(default: 0)*
The maximum (or fastest) speed, in frames, that the column will attempt to update. 0 = on every frame.

**windup** [integer] *(default: 3)*
How many cycles a column will run to fade-in as a soft-start. 0 = no soft start.

**alwaysWindup** [boolean] *(default: 0)*
If controls are set, new columns will windup if set to *true*.

**frameSkip** [integer] *(default: 2)*
The maximum number of frames to attempt to render at a speed of 0 in order to help speed up rendering and stop bunching. Image Rain will randomly pick a higher count to render.
*Note: May impact cpu performance at high numbers.*

**skipChance** [float] *(default: 0.3)*
0 to 1, The chance that at speed 0 Image Rain will skip frames. 1 = every time.

**backgroundColor** [hex] *(default: #fff)*
The background color of the columns.

**spriteCropX** [integer] *(default: 0)*
In pixels, will zoom in x*2 pixels on the x-axis when pre-rendering sprites.

**spriteCropY** [integer] *(default: 0)*
In pixels, will zoom in y*2 pixels on the y-axis when pre-rendering sprites.

**fastStart** [boolean] *(default: false)*
If *true*, will start running immediately on page load. When *false* the user must click the image to start the animation.

**controls** [boolean] *(default: false)*
Debug / demo controls. If *true* and if controls are present *(see ImageRainControls.html)* then the controls will be populated with current parameters and allow on-the-run control of the animation.