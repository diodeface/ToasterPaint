// constants for quick modifications
const CANVAS_SCALE = 10;
const PREVIEW_SCALE = 10;

// set your photo
const IMAGE_URL = 'photo.jpg';

// set your background and LED colors in hex
const BACKGROUND_COLOR = '#820075';
const LED_COLOR = '#FFFFFF';

// set your displays superimposed onto the image
const DISPLAYS = [
    {
        id: 'eye',
        width: 16,
        height: 8,
        transform: 'translateX(-54.2px) translateY(-11px) rotateX(-9deg) rotateY(-50deg) rotateZ(10deg) scaleX(0.342) scaleY(0.31)'
    },
    {
        id: 'nose',
        width: 8,
        height: 8,
        transform: 'translateX(47px) translateY(18px) rotateX(-8deg) rotateY(-50deg) rotateZ(10deg) scaleX(0.35) scaleY(0.31)'
    },
    {
        id: 'mouth',
        width: 32,
        height: 8,
        transform: 'translateX(-112px) translateY(51px) rotateX(-9deg) rotateY(-50deg) rotateZ(10deg) scaleX(0.335) scaleY(0.31)'
    },
];







const messageSection = document.getElementById('message');
const canvasSection = document.getElementById('canvases');
const photoSection = document.getElementById('photo');
photoSection.style.backgroundImage = 'url(' + IMAGE_URL + ')';

// state and events
let isDrawing = false;
let drawColor = LED_COLOR;

DISPLAYS.forEach(display => {
    // create canvas
    const canvas = document.createElement('canvas');
    canvas.id = display.id;
    canvas.width = display.width;
    canvas.height = display.height;
    canvas.style.width = display.width * CANVAS_SCALE + 'px';
    canvas.style.height = display.height * CANVAS_SCALE + 'px';

    const ctx = canvas.getContext('2d'); 
    resetCanvas(canvas);

    canvas.addEventListener('mousemove', drawPixel);

    // functions
    function drawPixel(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        ctx.fillStyle = drawColor;
        ctx.fillRect(x, y, 1, 1);
        updatePreview(canvas);
    }

    // create DOM for each canvas
    {
        // title text
        const title = document.createElement('p');
        const titleText = document.createTextNode(canvas.id + ' ('+canvas.width+'x'+canvas.height+')');
        title.appendChild(titleText);
        
        // copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'copy';
        copyBtn.onclick = () => {
            copyCanvas(canvas, canvas.id);
        }

        // paste button
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'load';
        loadBtn.onclick = () => {
            resetCanvas(canvas);
            loadCanvas(canvas, canvas.id);
        }
        
        // reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'reset';
        resetBtn.onclick = () => {
            resetCanvas(canvas);
            showMessage(canvas.id + ' has been reset.')
            updatePreview(canvas);
        }
        
        // canvas button section
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('btn-container');
        btnContainer.appendChild(copyBtn);
        btnContainer.appendChild(loadBtn);
        btnContainer.appendChild(resetBtn);

        // canvas section
        const canvasContainer = document.createElement('div');
        canvasContainer.classList.add('canvas-container');
        
        canvasContainer.appendChild(title);
        canvasContainer.appendChild(canvas);
        canvasContainer.appendChild(btnContainer);
        canvasSection.appendChild(canvasContainer);
    
        // preview
        const preview = document.createElement('div');
        preview.className = 'preview';
        preview.style.transform = display.transform;
    
        const img = document.createElement('img');
        img.id = display.id + '-preview';
        img.width = display.width;
        img.height = display.height;
        img.style.width = display.width * PREVIEW_SCALE + 'px';
        img.style.height = display.height * PREVIEW_SCALE + 'px';
        img.src = canvas.toDataURL();
    
        preview.appendChild(img);
        photoSection.appendChild(preview);
    }
});

function updatePreview(canvas) {
    const img = document.getElementById(canvas.id + '-preview');
    img.src = canvas.toDataURL();
}

function resetCanvas(canvas) {
    const ctx = canvas.getContext('2d'); 
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function copyCanvas(canvas, id = '') {
    try {
        const ctx = canvas.getContext('2d');
        const bytes = [];
        for(let row = 0; row < canvas.width; row++) {
            let result = 0;
            for(let bit = 7; bit >= 0; bit--) {
                const point = matrixToPoint(bit, row);
                const data = ctx.getImageData(point[0], point[1], 1, 1).data;
                const hex = '#' + ((data[0] << 16) | (data[1] << 8) | data[2]).toString(16);
                result = (result << 1) | ((hex.toUpperCase() == LED_COLOR.toUpperCase()) ? 1 : 0);
            }
            bytes.push(result);
        }
        let result = '';
        if(getBitmapFormat() == 'binary') {
            result = bytes.map(byte => {
                return '0b' + byte.toString(2).padStart(8, '0');
            }).join(',<br>');
        } else {
            result = bytes.map(byte => {
                return '0x' + byte.toString(16).padStart(2, '0');
            }).join(', ');
        }
        navigator.clipboard.writeText(result);
        showMessage('Copied ' + id + ' to clipboard: <br><br>'+result);
    } catch (err) {
        showMessage(err);
    }
}

function loadCanvas(canvas, id = '') {
    navigator.clipboard.readText()
    .then(text => {
        // parse text
        const values = text.match(/\b0[bB][01]+|\b0[xX][0-9a-fA-F]+\b/g);
        const bytes = values.map(value => {
            if (/^0[bB][01]+$/.test(value)) return parseInt(value.replace(/^0[bB]/, ''), 2);
            if (/^0[xX][0-9a-fA-F]+$/.test(value)) return parseInt(value, 16);
            return 0;
        });

        
        // display on cavnas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = LED_COLOR;
        for(const row in bytes) {
            const byte = bytes[row];
            for(let i = 0; i < 8; i++) {
                const point = matrixToPoint(i, row);
                if((byte >> i)  & 1) ctx.fillRect(point[0], point[1], 1, 1);
            }
        }
        updatePreview(canvas);
        showMessage(
            (bytes.length % 8) == 0
            ? 'Successfully loaded ' + id + ' from clipboard'
            : 'Successfully loaded ' + id + ' from clipboard, but bitmap row count is not divisible by 8. Did you copy the whole bitmap?'
        );
    })
    .catch(err => {
        showMessage(err);
    })
}

function showMessage(message) {
    messageSection.innerHTML = message;
}

function getBitmapFormat() {
    return document.getElementById('binary').checked ? 'binary' : 'hex';
}

function matrixToPoint(bit, row) {
    const offset = Math.floor(row / 8) * 8;
    return [(7 - bit + offset), (row - offset)];
}

document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('mouseup', () => isDrawing = false);

document.addEventListener('mousedown', (e) => {
    //e.preventDefault();
    drawColor = e.button === 2 ? BACKGROUND_COLOR : LED_COLOR;
    isDrawing = true;
});