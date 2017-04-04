'use strict';

class ImageRain
{
    constructor(settings)
    {  
        this.settings = settings;

        // Verify parameters and set defaults
        if ( !this.settingsCheck(settings) ) { return; }

        // Populate demo controls
        if ( settings.controls ) { this.setControls();  }

        // Setting the default on/off state
        this.isRunning = false;
        if (settings.fastStart) { this.isRunning = true; }

        const container = document.getElementById(settings.container);

        // Styling the container
        container.style.position = 'relative';

        // Primary means of starting & stopping
        if (settings.isClickToRun)
        {
            document.getElementById(settings.container).addEventListener('click', () => { this.startStop(); } );
            container.style.cursor = 'pointer';
        }

        // Will house canvas elements
        this.canvases = {};

        // load sprites -> load background -> initialize -> start/stop
        this.loadSprites();
    }

    // Primary loop: invokes each column to check and draw as needed
    updateColumns()
    {
        this.columns.map((column) => {
            column.check();
        });

        if (this.isRunning)
        {
            requestAnimationFrame(() => { this.updateColumns(); });
        }
    }

    // Set a flag to be running or not    
    startStop()
    {
        if (this.isRunning)
        {
            this.isRunning = false;
        }
        else
        {
            this.isRunning = true;
            requestAnimationFrame(() => { this.updateColumns(); });
        }
    }

    // Verifies settings and sets defaults
    settingsCheck()
    {
        const settings = this.settings;

        // These are all hard-coded requirements must be met
        if (!settings.hasOwnProperty('container') ||
            !settings.hasOwnProperty('backgroundUrl') ||
            !settings.hasOwnProperty('spritesUrl') ||
            !settings.hasOwnProperty('spriteScale'))
        {
            console.log('imageRain: Missing parameters! Check for container, backgroundUrl, spritesUrl, spriteFrameCount, and spriteScale');
            return false;
        }

        // Ensure things are cast properly as numbers, booleans, or strings.
        this.typeCheck();

        if (!settings.hasOwnProperty('scale') || settings.scale <= 0 || isNaN(settings.scale))
        {
            settings.scale = 16;
        }

        if (!settings.hasOwnProperty('fade') || settings.fade < 0 || settings.fade > 1 || isNaN(settings.fade))
        {
            settings.fade = 0.5;
        }

        if (!settings.hasOwnProperty('fadeCount') || settings.fadeCount < 0 || isNaN(settings.fadeCount))
        {
            settings.fadeCount = 6;
        }

        if (!settings.hasOwnProperty('minSpeed') || settings.minSpeed < 0 || isNaN(settings.minSpeed))
        {
            settings.minSpeed = 5;
        }

        if (!settings.hasOwnProperty('maxSpeed') || settings.maxSpeed < 0 || isNaN(settings.maxSpeed))
        {
            settings.maxSpeed = 0;
        }

        if (settings.minSpeed < settings.maxSpeed)
        {
            settings.minSpeed = settings.maxSpeed;
        }

        if (!settings.hasOwnProperty('windup') || settings.windup < 0 || isNaN(settings.windup))
        {
            settings.windup = 3;
        }

        if (!settings.hasOwnProperty('alwaysWindup') || typeof(settings.alwaysWindup) !== 'boolean')
        {
            settings.alwaysWindup = false;
        }

        if (!settings.hasOwnProperty('frameSkip') || settings.frameSkip < 0 || isNaN(settings.frameSkip))
        {
            settings.frameSkip = 2;
        }

        if (!settings.hasOwnProperty('skipChance') || settings.skipChance < 0 || isNaN(settings.skipChance))
        {
            settings.skipChance = 0.3;
        }

        if (!settings.hasOwnProperty('backgroundColor') || typeof(settings.backgroundColor) !== 'string')
        {
            settings.backgroundColor = "#000000";
        }

        if (!settings.hasOwnProperty('spriteCropX') || settings.spriteCropX < 0 || isNaN(settings.spriteCropX))
        {
            settings.spriteCropX = 0;
        }

        if (!settings.hasOwnProperty('spriteCropY') || settings.spriteCropY < 0 || isNaN(settings.spriteCropY))
        {
            settings.spriteCropY = 0;
        }

        if (!settings.hasOwnProperty('fastStart') || typeof(settings.fastStart) !== 'boolean')
        {
            settings.fastStart = true;
        }

        if (!settings.hasOwnProperty('controls') || typeof(settings.controls) !== 'boolean')
        {
            settings.controls = false;
        }

        if (!settings.hasOwnProperty('isClickToRun') || typeof(settings.isClickToRun) !== 'boolean')
        {
            settings.isClickToRun = true;
        }

        return true;
    }

    // Checks and casts expected types for each setting as strings break things.
    typeCheck()
    {
        const settings = this.settings;

        const numberProps =
        [
            'spriteScale',
            'spriteFrameCount',
            'scale',
            'fade',
            'fadeCount',
            'minSpeed',
            'maxSpeed',
            'windup',
            'frameSkip',
            'skipChance',
            'spriteCropX',
            'spriteCropY',
        ];

        const booleanProps =
        [
            'fastStart',
            'controls',
            'isClickToRun',
        ];

        // Cast expected numbers as a number. Default checking will worry about the NaNs.
        for (let prop in numberProps)
        {
            if (settings.hasOwnProperty(prop))
            {
                settings[prop] = Number(settings[prop]);
            }
        }

        // Need actual booleans over strings as strings break things.
        for (let prop in booleanProps)
        {
            if (settings.hasOwnProperty(prop))
            {
                if (settings[prop] === 'true')
                {
                    settings[prop] = true;
                }
                else if (settings[prop] === 'false')
                {
                    settings[prop] = false;
                }
            }
        }
    }

    // Creates and loads an image for the sprite sheet
    loadSprites()
    {
        const settings = this.settings;

        settings['sprites'] = new Image();
        settings.sprites.src = settings.spritesUrl;

        settings.sprites.onload = () =>
        {
            /*
                Determine if the sprite sheet is vertical or horizontal
                by using the user-provided dimensions (spriteScale.)
            */

            const width = settings.sprites.width / settings.spriteScale;
            const height = settings.sprites.height / settings.spriteScale;

            settings.spriteFrameCount = settings.sprites.height/settings.spriteScale;

            settings.spriteSheetIsHorizontal = false;
            settings.spriteSheetIsVertical = false;

            // It will be assumed any sprite sheet wider than one frame will be 'true' as necessary
            if (width > 1)  { settings.spriteSheetIsHorizontal = true; }
            if (height > 1) { settings.spriteSheetIsVertical = true; }

            this.loadBackground();
        }
    }

    // Creates and loads the background image
    loadBackground()
    {
        const settings = this.settings;

        settings['backgroundImg'] = new Image();
        settings.backgroundImg.src = settings.backgroundUrl;

        settings.backgroundImg.onload = () => { this.initRain(); }
    }

    // Creates all canvases, set dimensions, and renders sprite atlases.
    initRain()
    {
        const settings = this.settings;

        // The background image determins final dimensions
        settings.canvasHeight = settings.backgroundImg.height;
        settings.canvasWidth = settings.backgroundImg.width;

        const canvasContainer = document.getElementById(settings.container);
        canvasContainer.style.width = settings.canvasWidth + 'px';
        canvasContainer.style.height = settings.canvasHeight + 'px';

        /* 
            Create the necessary canvaes and return their context:
            - Backbround layer
            - Sprite layer
            - Fade layer
        */

        settings.bgCtx     = this.createCanvas('bgLayer', {styles: {position:'absolute', zIndex:1, top:0, left:0}}, {props: {width:settings.canvasWidth, height:settings.canvasHeight,},}, true);
        settings.spriteCtx = this.createCanvas('spriteLayer', {styles: {position:'absolute', zIndex:2, top:0, left:0}}, {props: {width:settings.canvasWidth, height:settings.canvasHeight,},}, true);
        settings.fadeCtx   = this.createCanvas('fadeLayer', {styles: {position:'absolute', zIndex:3, top:0, left:0}}, {props: {width:settings.canvasWidth, height:settings.canvasHeight,},}, true);

        //Pre-rendering
        this.createBackground();  // Renders the background image
        this.setSpriteVars();     // Specific dimensions related to sprites. NOTE: may be outmoded and needs refactoring?
        this.setDrawVars();       // Drawing calculations used throughout the program
        this.createSpriteAtlas(); // Pre-renders the sprites to be used from the sprite source
        this.createFadeAtlas();   // Pre-renders the fade to be applied over the sprites

        // Pre-calculate all possible offsets to reduce math and cpu usage
        this.settings.offsets = {}; // { draw, fade, sprites, windup }
        this.setSpriteOffsets();    // Sprite atlast positions
        this.setDrawOffsets();      // Column positions used in drawing sprites
        this.setFadeOffsets();      // Column positions used in drawing fades
        this.setWindupOffsets();    // Alpha increments used for ctx.globalAlpha adjustments

        // Create the column objects that will be drawing to the canvases
        this.createColumns();

        // Setup is now complete, either run now or wait for user input
        if (settings.fastStart = true)
        {
            requestAnimationFrame(() => { this.updateColumns(); });
        }
    }

    // Creates a canvas element and returns a canvas context
    createCanvas(id, canvasVars, ctxVars, isVisible)
    {
        let canvasLayer = document.createElement('canvas');
        let ctx = canvasLayer.getContext('2d');

        // Store the canvas element for possible future recall
        this.canvases[id] = canvasLayer;

        canvasLayer.id = 'irCanvas_' + id;

        // Apply stylings as necessary, such as dimensions or visibility
        canvasLayer = this.styleCanvas(canvasLayer, canvasVars);
        ctx = this.styleCtx(ctx, ctxVars);

        // Non-visible canvases are usually the atlases
        if (isVisible)
        {
            document.getElementById(this.settings.container).appendChild(canvasLayer);
        }

        return ctx;
    }

    // Canvas element styles and properites
    styleCanvas(canvas, canvasVars)
    {
        // Set or change properites
        if (canvasVars.hasOwnProperty('styles'))
        {
            for (let style in canvasVars.styles)
            {
                canvas.style[style] = canvasVars.styles[style];
            }
        }

        // Add or remove classes
        if (canvasVars.hasOwnProperty('classes'))
        {
            canvasVars.classes.map((className) =>
            {
                this.toggleClass(canvas, className);
            });
        }

        return canvas;
    }

    // Context properties
    styleCtx(ctx, ctxVars)
    {
        if (ctxVars.hasOwnProperty('props'))
        {
            for (let prop in ctxVars.props)
            {
                ctx.canvas[prop] = ctxVars.props[prop];
            }
        }

        return ctx;
    }

    // Renders the background
    createBackground()
    {
        const settings = this.settings;
        let bgCtx = settings.bgCtx;
        bgCtx.drawImage(settings.backgroundImg, 0, 0, settings.backgroundImg.width, settings.backgroundImg.height, 0, 0, bgCtx.canvas.width, bgCtx.canvas.height);
    }

    // Static math used in the drawing processes
    setDrawVars()
    {
        const settings = this.settings;
        const rows = Math.floor(settings.canvasHeight/settings.scale);

        // Width & height of the to-be-drawn sprites as well as total rows
        // NOTE: width & height are currently identical in future hopes of odd-sized sprites
        settings.frontDraw =
        {
            width:   settings.scale,
            height:  settings.scale,
            rows:    rows + settings.fadeCount, // To ensure fade runs off-screen the fadeCount is included
        }

        // The total height based on rows, not canvas height
        settings.rowsHeight = Math.floor(settings.canvasHeight/settings.scale)*settings.frontDraw.height;
    }

    // Sprite math used in drawing sprites
    // NOTE: possibly outmoded and needs to be refactored out, used mostly at createSpriteAtlas
    setSpriteVars()
    {
        const settings = this.settings;

        settings.sprite =
        {
            xScale: settings.spriteScale,
            yScale: settings.spriteScale,
            frameCount: settings.spriteFrameCount - 1,
        }
    }

    // Pre-render sprites. Sprites are invterted to be like "windows" to mimic Matrix rain
    createSpriteAtlas()
    {
        const settings      = this.settings;
        const sprite        = settings.sprite;
        const frontDraw     = settings.frontDraw;

        let spriteWidth = frontDraw.width;
        let spriteHeight = frontDraw.height;

        // Getting width & height in preperation to create or update the canvas
        if (settings.spriteSheetIsHorizontal)
        {
            spriteWidth = frontDraw.width * settings.spriteFrameCount;
        }

        if (settings.spriteSheetIsVertical)
        {
            spriteHeight = frontDraw.height * settings.spriteFrameCount;
        }
        
        // Create or fetch an existing canvas
        let spriteBackCtx;
        if (!settings.hasOwnProperty('spriteBackCtx'))
        {
            spriteBackCtx = settings.spriteBackCtx = this.createCanvas('spriteBack', {},{props:{width:spriteWidth, height:spriteHeight,}}, false);
        }
        else
        {
            spriteBackCtx = settings.spriteBackCtx;

            // Update with new dimensions
            spriteBackCtx.canvas.width = spriteWidth;
            spriteBackCtx.canvas.height = spriteHeight;

            // Clearing the canvas for a new rendering
            spriteBackCtx.clearRect(0,0,spriteBackCtx.canvas.width, spriteBackCtx.canvas.height);
        }

        spriteBackCtx.fillStyle = settings.backgroundColor;

        // Setting how many columns to expect in this sprite sheet
        let columns = 1;

        if (settings.spriteSheetIsHorizontal)
        {
            columns = settings.spriteFrameCount;
        }

        // Iterate over each column, drawing all of its sprites
        for (let xInt = 0; xInt < columns; xInt++)
        {
            // Getting the current x position
            let xPos = (xInt * sprite.xScale) + settings.spriteCropX;

            // Iterate through each sprite, drawing it
            for (let yInt = 0; yInt < settings.spriteFrameCount; yInt++)
            {
                let yPos = (yInt * sprite.yScale) + settings.spriteCropY;
                let spriteWidth = sprite.xScale - settings.spriteCropX;
                let spriteHeight = sprite.yScale - settings.spriteCropY;

                // Fill in a solid square of background color
                spriteBackCtx.globalCompositeOperation = 'source-over';
                spriteBackCtx.fillRect(xInt*frontDraw.width, yInt*frontDraw.height, frontDraw.width, frontDraw.height);

                // Use xor to draw the sprite, creating a "window" that the background will show through
                spriteBackCtx.globalCompositeOperation = 'xor';
                spriteBackCtx.drawImage(settings.sprites, xPos, yPos, spriteWidth, spriteHeight, xInt*frontDraw.width, frontDraw.height*yInt, frontDraw.width, frontDraw.height)
            }
        }

        spriteBackCtx.globalCompositeOperation = 'source-over';
    }

    // Pre-renders a fade with increments to be drawn as a whole instead of trying to mix on-canvas
    createFadeAtlas()
    {
        const settings    = this.settings;
        const frontDraw   = settings.frontDraw;

        let fadeBackCtx;

        /*
            Setting the canvas height,
            where frameSkip will add extra space necessary for longer fades used during frame skips
            as well as 1 extra blank space that renders over the newest sprite being drawn (no fade)
        */
        settings.fadeHeight = frontDraw.height * (settings.fadeCount + this.settings.frameSkip);

        // Calculating additional heights for each frameSkip offset for easy rendering later
        let frame = 1;
        while (frame < this.settings.frameSkip)
        {
            settings['fadeHeight'+(frame+1)] = settings.fadeHeight + (frontDraw.height * frame);
            frame = frame + 1;
        }

        // Create or fetch an existing fade canvas
        if (!settings.hasOwnProperty('fadeBackCtx'))
        {
            fadeBackCtx = settings.fadeBackCtx = this.createCanvas('fadeBack', {},{props:{width:frontDraw.width*this.settings.frameSkip, height:settings.fadeHeight,}}, false);
        }
        else
        {
            fadeBackCtx = settings.fadeBackCtx;
            this.styleCtx(fadeBackCtx, {props:{width:frontDraw.width*this.settings.frameSkip, height:settings.fadeHeight,}});
            fadeBackCtx.clearRect(0,0,fadeBackCtx.canvas.width, fadeBackCtx.canvas.height);
        }

        // Because fillRect can be blurry & bleed, we'll draw to a temporary back canvas and drawImage a clean cut
        const tempBackCanvas = document.createElement('canvas');
        const tempBackCtx = tempBackCanvas.getContext('2d');

        tempBackCtx.canvas.width = frontDraw.width*2;
        tempBackCtx.canvas.height = frontDraw.height*2;

        // Filling in the canvas height section
        tempBackCtx.fillStyle = this.settings.backgroundColor;
        tempBackCtx.globalAlpha = settings.fade;
        tempBackCtx.clearRect(0, 0, tempBackCtx.canvas.width, tempBackCtx.canvas.height);
        tempBackCtx.fillRect(0, 0, tempBackCtx.canvas.width, tempBackCtx.canvas.height);

        // Filling in the fade increments
        const fadeIncrement = settings.fade/settings.fadeCount;

        fadeBackCtx.globalAlpha = settings.fade;

        // Setting up a loop to create as many fade increments as necessary per frameSkip
        const fadeIncrements = ((offset) =>
        {
            for (let i = 0; i < settings.fadeCount; i++)
            {
               fadeBackCtx.drawImage(tempBackCtx.canvas, 2, 2, frontDraw.width, frontDraw.height, frontDraw.width*offset, frontDraw.height * (i+offset), frontDraw.width, frontDraw.height);
               fadeBackCtx.globalAlpha = settings.fade - (fadeIncrement*(i+1));
            }
        });

        // Draws the initial fade used in normal rendering
        fadeIncrements(0);

        // Draws each additional fade used for frame skips
        for (frame = 1; frame < settings.frameSkip; frame++)
        {
            // Draw a solid block at maximum fade per frame skip, which stops blank from appearing in rendering
            fadeBackCtx.globalAlpha = settings.fade;
            fadeBackCtx.drawImage(tempBackCtx.canvas, 2, 2, frontDraw.width, frontDraw.height, frontDraw.width*frame, 0, frontDraw.width, frontDraw.height*frame);

            // Draw the increments at the current offset
            fadeIncrements(frame);
        }
    }

    // Pre-calcs the y-offset for each sprite atlas row
    setSpriteOffsets()
    {
        const frontDraw = this.settings.frontDraw;
        this.settings.offsets['sprites'] = [];

        for (let i = 0; i < this.settings.sprite.frameCount; i++)
        {
            this.settings.offsets.sprites[i] = frontDraw.height*i;
        }
    }

    // Pre-calcs the y-offset for each drawing canvas row
    setDrawOffsets()
    {
        const frontDraw = this.settings.frontDraw;
        this.settings.offsets['draw'] = [];

        // Add each frame skip as an additional row to keep things in sync
        const rowCount = frontDraw.rows + (this.settings.frameSkip - 1);

        for (let i = 0; i < rowCount; i++)
        {
            this.settings.offsets.draw[i] = frontDraw.height*i;
        }
    }

    // Pre-calcs each y-offset for the fades
    setFadeOffsets()
    {
        const frontDraw = this.settings.frontDraw;
        this.settings.offsets['fade'] = [];

        // Add each frame skip as an additional row to keep things in sync
        const rowCount = frontDraw.rows + (this.settings.frameSkip - 1);

        /* 
            Fades will start drawing above (behind) the current sprite as they're one long sprite
            fade starting position  = sprite height * fade count
            Also since fade includes one blank tile for the new sprite, adjust accordingly
        */
        const offsetHeight = frontDraw.height * this.settings.fadeCount;

        for (let i = 0; i < rowCount; i++)
        {
            this.settings.offsets.fade[i] = (frontDraw.height*i) - offsetHeight;
        }
    }

    // Pre-calcs the fade increments used in windup
    setWindupOffsets()
    {
        const frontDraw = this.settings.frontDraw;
        this.settings.offsets['windup'] = [];

        const increment = 1 / (this.settings.windup + 1);

        for (let i = 0; i < this.settings.windup; i++)
        {
            this.settings.offsets.windup[i] = increment * (i + 1);
        }
    }

    // Creates a column object that will draw its own column of sprites & fade
    createColumns()
    {
        const settings = this.settings;

        // Get total number of columns that can fit onto the background image
        const totalColumns = Math.ceil(settings.canvasWidth / settings.scale);

        let canWindup = false;

        if (!this.columns)
        {
            this.columns = [];
            canWindup = true;
        }

        // Generate the number of columns needed
        while (this.columns.length < totalColumns)
        {
            this.columns.push(new RainColumn(settings, this.columns.length, canWindup));
        }

        // If settings were updated and more columns exist than needed
        if (this.columns.length > totalColumns)
        {
            this.columns.splice(totalColumns, this.columns.length - totalColumns);
        }
    }

    // Toggles css classes similar to jQuery's .toggle()
    toggleClass(element, className)
    {
        // Simple toggle
        if (element.classList)
        {
            element.classList.toggle(className);
        }
        // String-manipulate to add or remove a class
        else
        {
            const classes = element.className.split(' ');
            const index = classes.indexOf(className);

            if (index >= 0)
            {
                classes.splice(index, 1);
            }
            else
            {
                classes.push(className);
            }

            element.className = classes.join(' ');
        }
    }

    // For demo controls: Sets all columns' counters to 0 and clears sprite & fade canvases
    reset()
    {
        this.isRunning = false;

        // Requesting an animation frame to ensure columns are done rendering
        requestAnimationFrame(() =>
        {
            this.columns.map((column, index) => {
                column.reset();
            });

            this.settings.spriteCtx.clearRect(0,0,this.settings.spriteCtx.canvas.width, this.settings.spriteCtx.canvas.height);
            this.settings.fadeCtx.clearRect(0,0,this.settings.fadeCtx.canvas.width, this.settings.fadeCtx.canvas.height);
        });
    }

    // For demo controls: sets css to display or hide canvases
    showHideLayers()
    {
        // Enable or disable layers
        const layers =
        [
            document.getElementById('bgLayer'),
            document.getElementById('spriteLayer'),
            document.getElementById('fadeLayer'),
        ];

        layers.map((layer) =>
        {
            if (layer.checked === true)
            {
                this.styleCanvas(this.canvases[layer.id], {styles:{display:'block'}});
            }
            else
            {
                this.styleCanvas(this.canvases[layer.id], {styles:{display:'none'}});
            }
        });
    }

    //For demo controls: populates the html inputs with current settings
    setControls()
    {
        const settings = this.settings;

        // Adding event listeners to inputs
        document.getElementById('bgLayer').addEventListener('click', () => {this.showHideLayers();});
        document.getElementById('spriteLayer').addEventListener('click', () => {this.showHideLayers();});
        document.getElementById('fadeLayer').addEventListener('click', () => {this.showHideLayers();});
        document.getElementById('irBtnPause').addEventListener('click', () => {this.startStop();});
        document.getElementById('irBtnApply').addEventListener('click', () => {this.updateSettings();});
        document.getElementById('irBtnReset').addEventListener('click', () => {this.reset();});

        // Setting the values for these specific settings
        const elements =
        [
            'scale',
            'fade',
            'fadeCount',
            'minSpeed',
            'maxSpeed',
            'windup',
            'backgroundColor',
            'frameSkip',
            'skipChance',
        ];

        elements.map((id) =>
        {
            document.getElementById(id).value = settings[id];
        });

        /* 
            Set the check values to true for layer control
            This is necessary if used in a framework like React which does not like the hard-coded 'checked'
        */
        const layers =
        [
            document.getElementById('bgLayer'),
            document.getElementById('spriteLayer'),
            document.getElementById('fadeLayer'),
        ];

        layers.map((layer) =>
        {
            layer.checked = true;
        });
    }

    // For demo controls: updates settings to new values
    updateSettings()
    {
        // Fetcing values. Note the casting to Number for most of them.
        let newSettings = {
            'scale':           Number(document.getElementById('scale').value),
            'fade':            Number(document.getElementById('fade').value),
            'fadeCount':       Number(document.getElementById('fadeCount').value),
            'minSpeed':        Number(document.getElementById('minSpeed').value),
            'maxSpeed':        Number(document.getElementById('maxSpeed').value),
            'windup':          Number(document.getElementById('windup').value),
            'backgroundColor': document.getElementById('backgroundColor').value,
            'frameSkip':       Number(document.getElementById('frameSkip').value),
            'skipChance':      Number(document.getElementById('skipChance').value),
        };
        
        // Checking new values against existing values, removing the duplicates
        let keys = Object.keys(newSettings);

        keys.map((setting) =>
        {
            if (newSettings[setting] === this.settings[setting])
            {
                delete newSettings[setting];
            }
        });

        // Merge any new & unique values with existing values
        this.settings = Object.assign({},this.settings, newSettings);

        // Verify the settings
        if (!this.settingsCheck())
        {
            console.log('imageRain: bad or missing parameters on update! Check controls and inputs for errors.');
            return;
        }

        const callBacks =
        {
            background: this.createBackground(),
            drawVars: this.setDrawVars(),
            spriteAtlas: this.createSpriteAtlas(),
            fadeAtlas: this.createFadeAtlas(),
            spriteOffsets: this.setSpriteOffsets(),
            drawOffsets: this.setDrawOffsets(),
            fadeOffsets: this.setFadeOffsets(),
            windupOffsets: this.setWindupOffsets(),
            createColumns: this.createColumns(),
        }

        let isCallbackNeeded =
        {
            background:false,
            drawVars:false,
            spriteAtlas:false,
            fadeAtlas:false,
            spriteOffsets:false,
            drawOffsets:false,
            fadeOffsets:false,
            windupOffsets:false,
            createColumns:false,
        }

        keys = Object.keys(callBacks);

        /*
            Multiple settings can trigger the same callback.
            Checking settings in groups and trigging a callback once.
        */

        if (newSettings.hasOwnProperty('highContrast'))
        {
            isCallbackNeeded.background = false;
        }

        if (newSettings.hasOwnProperty('spriteCropX') ||
            newSettings.hasOwnProperty('spriteCropY') ||
            newSettings.hasOwnProperty('scale') ||
            newSettings.hasOwnProperty('backgroundColor'))
        {
            isCallbackNeeded.spriteAtlas = true;
        }

        if (newSettings.hasOwnProperty('fade') ||
            newSettings.hasOwnProperty('fadeCount') ||
            newSettings.hasOwnProperty('scale') ||
            newSettings.hasOwnProperty('backgroundColor'))
        {
            isCallbackNeeded.fadeAtlas = false;
        }

        if (newSettings.hasOwnProperty('fadeCount') ||
            newSettings.hasOwnProperty('scale'))
        {
            isCallbackNeeded.fadeOffsets = true;
        }

        if (newSettings.hasOwnProperty('scale'))
        {
            isCallbackNeeded.drawVars = true;
            isCallbackNeeded.drawOffsets = true;
            isCallbackNeeded.spriteOffsets = true;
            isCallbackNeeded.createColumns = true;
        }

        // Invoking the callbacks
        keys.map((key) =>
        {
            if (isCallbackNeeded[key])
            {
                callBacks[key];
            }
        });

        // Sending each column the new 'settings' object
        this.columns.map((column, index) => {
            column.applySettings(this.settings);
        });

    }
}

// The column object that will draw to the canvases
class RainColumn
{
    constructor(settings, index, canWindup)
    {
        // Index reflects the x-position of this column
        this.index = index;

        // Sets global vars for this column
        this.applySettings(settings);


        this.frameSkip  = 1; // The current number of frames to attempt to render
        this.currentRow = 0; // The current row to be rendered

        // The number of frames to wait to render again
        this.delay      = this.getRandom(this.settings.minSpeed,this.settings.maxSpeed);

        // Current frame in the delay
        this.delayPos   = this.delay; 

        // Is this column winding up?
        this.isInWindup = false;

        if (settings.alwaysWindup || canWindup)
        {
            this.isInWindup = true;
        }

        this.windupCount = 0; // Current windup position, compared to windupCount

        this.columnXOffset = settings.frontDraw.width * index; // The x-position of this column
        this.targetRows = settings.frontDraw.rows;             // Number of rows to render
    }

    // Primary loop: checks delay position and sets new delays on a new cycle
    check()
    {
        // Is there a delay?
        if (this.delayPos > 0)
        {
            this.delayPos = this.delayPos - 1;
            return;
        }
        // It can draw...
        else
        {
            this.draw();

            // Has it reached its target row count?
            if (this.currentRow < this.targetRows)
            {
                this.currentRow = this.currentRow + this.skipAmount;
                this.delayPos = this.delay;
            }
            // It has reached its target, set new delays and frame skips
            else
            {
                this.currentRow = 0;
                this.delay = this.getRandom(this.settings.minSpeed, this.settings.maxSpeed); // Set a new speed
                this.targetRows = this.settings.frontDraw.rows;

                // A chance to go even faster by skipping frames
                if (this.delay === 0)
                {
                    // A chance to frame skip
                    if (Math.random() <= this.settings.skipChance)
                    {
                        // Pick a random skip amount (if frameSkip is 2, then it will always be 2)
                        this.skipAmount = this.getRandom(2, this.settings.frameSkip);
                        this.targetRows = this.targetRows + this.skipAmount;
                    }
                    // No frame skip
                    else
                    {
                        this.skipAmount = 1;
                    }
                }
            }
        }
    }

    // Invokes the rendering of the sprites and fade
    draw()
    {
        // Setting alpha values, depending if its in windup or not
        if (!this.isInWindup)
        {
            this.spriteCtx.globalAlpha = 1;
            this.fadeCtx.globalAlpha = 1;
        }
        else
        {
            const windupIncrements = this.settings.offsets.windup;

            this.spriteCtx.globalAlpha = windupIncrements[this.windupCount];
            this.fadeCtx.globalAlpha = windupIncrements[this.windupCount];

            // currentRow can be bigger than rows when frameSkip is applied
            if (this.currentRow >= this.settings.frontDraw.rows)
            {
                this.windupCount = this.windupCount + 1;
                
                if (this.windupCount === this.settings.windup)
                {
                    this.isInWindup = false;
                }
            }
        }

        this.renderFade();
        this.renderSprite();
    }

    // Renders the fade that will darken the sprites over the background
    renderFade()
    {
        const settings = this.settings;
        const frontDraw = settings.frontDraw; // Drawing dimensions

        const fadeOffset = settings.offsets.fade[this.currentRow]; // y offset on the canvas

        // Adjust the height of the fade to be drawn
        let fadeHeight = settings.fadeHeight;
        if (this.skipAmount > 1)
        {
            // Longer fades when skipping fades
            fadeHeight = settings['fadeHeight' + this.skipAmount];
        }

        // the x-offset of the fade sprite to be used
        const xOffset = frontDraw.width * (this.skipAmount - 1);

        // Clear the whole length of the fade and then draw the new fade
        this.fadeCtx.clearRect(this.columnXOffset, fadeOffset, frontDraw.width, fadeHeight);
        this.fadeCtx.drawImage(this.fadeBackCtx.canvas, xOffset, 0, frontDraw.width, fadeHeight, this.columnXOffset, fadeOffset, frontDraw.width, fadeHeight);
    }

    // Renders the sprites to canvas
    renderSprite()
    {
        const settings = this.settings;
        const frontDraw = settings.frontDraw;

        /*
            Get the sprite possible sprite counts to random picking
            NOTE: in the future frameCount should be auto-calculated and separate for horizontal & vertical aspects
        */
        let horzSpriteCount = Math.floor(settings.sprite.frameCount/this.skipAmount);
        let vertSpriteCount = Math.floor(settings.sprite.frameCount/this.skipAmount);

        /*
            1 or greater? Render sprites as needed.
            0? Skip ahead, render 1 sprite.
            NOTE: this is broken, draws over a sprite and I'm currently not sure why...
        */
        /*
            currentRow adjustment at 0 (none) or greater based on frameSkip
            Only vertical for now until a rotation can be coded in for horizontal groups.
        */
        const currentRowOffset = (vertSpriteCount === 0) ? 0 : this.skipAmount - 1;
        const clearDistance    = (vertSpriteCount === 0) ? 1 : this.skipAmount;

        // Random x & y positions for our sprite sheet
        const spritePos =
        [
            (settings.spriteSheetIsHorizontal) ? settings.offsets.sprites[this.getRandom(0,horzSpriteCount)] : 0,
            (settings.spriteSheetIsVertical) ? settings.offsets.sprites[this.getRandom(0,vertSpriteCount)] : 0,
        ];

        this.spriteCtx.clearRect(this.columnXOffset, settings.offsets.draw[this.currentRow], frontDraw.width, frontDraw.height*clearDistance);
        this.spriteCtx.drawImage(this.spriteBackCtx.canvas, spritePos[0], spritePos[1], frontDraw.width, frontDraw.height*this.skipAmount, this.columnXOffset, settings.offsets.draw[this.currentRow], frontDraw.width, frontDraw.height*this.skipAmount);
    }

    getRandom(min,max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Applies settings and, for demo controls, applies updated settings.
    applySettings(newSettings)
    {
        this.settings      = newSettings;

        this.bgCtx         = newSettings.bgCtx;         // visible background layer ctx
        this.spriteCtx     = newSettings.spriteCtx;     // visible sprite layer ctx
        this.fadeCtx       = newSettings.fadeCtx;       // visible fade layer ctx
        this.spriteBackCtx = newSettings.spriteBackCtx; // sprite atlas ctx
        this.fadeBackCtx   = newSettings.fadeBackCtx;   // fade atlast ctx

        this.columnXOffset = newSettings.frontDraw.width * this.index; // x-offset of the column on canvas
        this.targetRows = newSettings.frontDraw.rows; // Target number of rows to render
    }

    // For demo controls: resets counters
    reset()
    {
        this.isInWindup = true;
        this.windupCount = 0;
        this.currentRow = 0;
    }
}