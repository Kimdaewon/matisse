/**
 * This is the main javascipt file to handle adding, editing, deleting all elements on canvas (text, rectangle, circle etc)
 * Uses 'Fabric.js' library for client side
 * Node.js and  Node Package Manager (NPM) for server side - JavaScript environment that uses an asynchronous event-driven model.
 */
// Globals
var fillColor = "#AAAAAA";
var points = {}, textEl, tools = {};
var drawShape = false;
var action, shapeArgs, currTool;
var xPoints = [],   yPoints = [];
var xOffset, yOffset;

// create canvas object
var canvas = new fabric.Canvas('c', {
    backgroundColor: '#FFFFFF'
    //HOVER_CURSOR: 'pointer'
});

$(document).ready(init);


function init() {
	xOffset = getOffset(document.getElementById('canvasId')).left;
	yOffset = getOffset(document.getElementById('canvasId')).top;
	addTools()
    colorHandler();
    // clear canvas
    canvas.clear();
    // remove currently selected object
    canvas.remove(canvas.getActiveObject());
    observe('object:modified');
    observe('path:created');
    observe('selection:cleared');
    observe('object:moved');
	textEl = document.getElementById('textarea');
	textHandler();
	document.onkeydown=keyDown;
}

/**
 *  Called when other users add, modify or delete any object
 *  data - shape(data.shape) and args array (data.args)
 * 
 */
matisse.onDraw = function (data) {
    //(document.getElementById("debug")).value = actions[data.action]+'\n'+data.args;
    //alert(data.args.join());
    if (data.action == "modified") {
        modifyObject(data.args[0])
    }
    if (data.action == "modifyColor") {
        modifyColorOnOther(data.args[0]);
    }
    if (data.action == "drawpath") {
        drawPath(data.args[0])
    }
    if (data.action == "chat") {
        var txt = document.createTextNode(data.args[0].text)
        $("#chattext").append(txt);
    }
    if (tools[data.action] != undefined) tools[data.action].toolAction.apply(this, data.args);

}


function getObjectById(id) {
    var obj;
    var objs = canvas.getObjects();
    objs.forEach(function (object) {
        if (object.uid == id) {
            //alert((object.uid==id))
            obj = object;
        }
    });
    return obj;
}


function observe(eventName) {
    canvas.observe(eventName, function (e) {
        // alert(eventName);
        switch (eventName) {

        case "object:modified":
            var obj = e.memo.target;
            //alert(obj.angle);
            matisse.sendDrawMsg({
                action: "modified",
                args: [{
                    uid: obj.uid,
                    object: obj
                }] // When sent only 'object' for some reason object  'uid' is not available to the receiver method.
            })

            break;

        case "selection:cleared":
            //var obj = e.memo.target;
            matisse.sendDrawMsg({
                action: "clearText",
                args: []
            })
            var textEl = document.getElementById('textarea');
            textEl.value = "";
            //(document.getElementById("debug")).value = "selection cleared";
            break;
        case 'path:created':
            //alert("mousedown"+canvas.isDrawingMode);
            matisse.sendDrawMsg({
                action: 'drawpath',
                args: [{
                    _freeDrawingXPoints: xPoints,
                    _freeDrawingYPoints: yPoints
                }]
            });
            xPoints = [];
            yPoints = [];
            break;
        }
    })
}


function modifyObject(args) {
    var obj = getObjectById(args.uid);
	//canvas.setActiveObject(obj);
	var recvdObj = args.object;
    obj.set("left", recvdObj.left);
    obj.set("top", recvdObj.top);
    obj.set("scaleX", recvdObj.scaleX);
    obj.set("scaleY", recvdObj.scaleY);
    if (obj.type == "text") obj.text = recvdObj.text;
    obj.set("angle", recvdObj.angle);
	obj.setCoords(); // without this object selection pointers remain at orginal postion(beofore modified)
	/*======================================================================================================*/
	/*** for some reason below code not working for circle modification, hence commented and using above code
	/*======================================================================================================
	 for (var prop in recvdObj) {
			  obj.set(prop, recvdObj[prop]);
			  $("#chattext").append(prop);
			}
    	obj.setCoords();**/
	canvas.renderAll();
}


function clearText() {
    var textEl = document.getElementById('textarea');
    textEl.value = "";
}


/**
 * 
 * @property str, length
 * @type string
 */

function pad(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

/**
 * Returns color in RGB format
 * @property null
 * @type string
 */

function getRandomColor() {
    var getRandomInt = fabric.util.getRandomInt;
    return (
    pad(getRandomInt(0, 255).toString(16), 2) + pad(getRandomInt(0, 255).toString(16), 2) + pad(getRandomInt(0, 255).toString(16), 2));
}


// called when 'rectangle button' clicked

function handleClick(e) {
    resetCurrTool();
    currTool = e.target;
    currTool.setAttribute('border', "2px");
    document.getElementById("c").style.cursor = 'default'
    drawShape = true;
    //alert(e.target.id)
	if(e.target.id != "Draw") {
		canvas.isDrawingMode = false;
		document.getElementById("Draw").src =  'images/nobrush.png' 
	}
    switch (e.target.id) {
    case "Rectangle":
        action = "rect"
        shapeArgs = [{
            width: 100,
            height: 50,
            fillColor: fillColor,
            strokeColor: 0x000000,
            angle: 0,
            uid: uniqid()
        }];
        break;
    case "Circle":
        action = "circle"
        shapeArgs = [{
            radius: 20,
            width: 100,
            height: 50,
            fillColor: fillColor,
            angle: 0,
            uid: uniqid()
        }];
        break;
    case "Text":
        action = "text"
        shapeArgs = [{
            fontFamily: 'delicious_500',
            width: 100,
            height: 50,
            fillColor: fillColor,
            angle: 0,
            uid: uniqid()
        }];
        break;
    case "Draw":
        drawShape = false;
        //var drawingModeEl = document.getElementById('drawing-mode');
        canvas.isDrawingMode = !canvas.isDrawingMode;
        this.src = (!canvas.isDrawingMode) ? 'images/nobrush.png' : 'images/brush.png'

        if (canvas.isDrawingMode) {
            document.getElementById("c").style.cursor = 'crosshair'
            //drawingModeEl.className = 'is-drawing';
        } else {
            document.getElementById("c").style.cursor = 'default'
            // drawingModeEl.innerHTML = 'Enter drawing mode';
            //drawingModeEl.className = '';
        }
        break;
	
    }
}


//called when 'delete button' clicked

function deleteButtonListener(e) {
    deleteObjects();
}

function chatButtonListener(e) {
    var msg = $("#chat").val();
    msg = "from $:" + msg + "\n";
    //alert(msg);
    var txt = document.createTextNode(msg)
    $("#chattext").append(txt);
    matisse.sendDrawMsg({
        action: "chat",
        args: [{
            text: msg
        }]
    });
}


// Listener for Color section - because canvas.observe does not trigger modify event when color is changed.

function colorSelectListener(e) {
    // Determine which option was selected
    var newColor = this.options[this.selectedIndex].value;
    // Locally, set the line color to the selected value
    fillColor = newColor;
    // check if any object is currently selected
    if (canvas.getActiveObject()) {
        // get currently selected object
        var obj = canvas.getActiveObject();
        // apply selected color for stroke
        obj.set("stroke", fillColor);
        modifyColor(obj, fillColor);
        canvas.renderAll();
        matisse.sendDrawMsg({
            action: "modifyColor",
            args: [obj.uid, fillColor]
        })
        //alert(obj.uid);
        //delete obj;
    }
}

function handleMouseEvents() {
    var msg = "";
    $("#canvasId").mousedown(function (event) {
        resetCurrTool();
        msg = "==================\n";
        if (drawShape) {
            points.x = event.pageX - xOffset; //offset
            points.y = event.pageY - yOffset; //offset
            shapeArgs[0].left = points.x;
            shapeArgs[0].top = points.y;

            tools[action].toolAction.apply(this, shapeArgs);
            matisse.sendDrawMsg({
                action: action,
                args: shapeArgs
            });
            drawShape = false;
        }
        if (canvas.isDrawingMode) {
            xPoints = [];
            yPoints = [];
            xPoints.push(event.pageX - xOffset);
            yPoints.push(event.pageY - yOffset);

        }
    });
    // drawingModeEl.innerHTML = 'Cancel drawing mode';
    $("#canvasId").mousemove(function (event) {
        if (canvas.isDrawingMode) {
            xPoints.push(event.pageX - xOffset);
            yPoints.push(event.pageY - yOffset);
            msg += event.pageX + ", " + event.pageY + "\n :";

        }
    });
  
}

function resetCurrTool() {
    if (currTool) {
          currTool.setAttribute('border', "0");
    }
}


/**
 *  change the color of an object
 *  @property obj - object of which color needs to be changed, 
 *            fColor - fillcolor
 *   
 */

function modifyColor(obj, fillColor) {
    if (obj == undefined) return;
    if (obj.type != "path") obj.set("fill", fillColor);
}

function modifyColorOnOther(args) {
    var obj = getObjectById(args.uid);
    if (obj.type != "path") obj.set("fill", args.fillColor);
    canvas.renderAll();
}


function deleteObjects() {
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();
    matisse.sendDrawMsg({
        shape: "delete",
        uid: activeObject.uid

    })
    if (activeObject) {
        canvas.remove(activeObject);
    } else if (activeGroup) {
        var objectsInGroup = activeGroup.getObjects();
        canvas.discardActiveGroup();
        objectsInGroup.forEach(function (object) {
            canvas.remove(object);
        });
    }
}

function textHandler() {
if (textEl) {
    textEl.onfocus = function () {
        var activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            this.value = activeObject.text;
        }
    };
    textEl.onkeyup = function (e) {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            if (!this.value) {
                canvas.discardActiveObject();
            } else {
                activeObject.text = this.value;
            }
            canvas.renderAll();
            matisse.sendDrawMsg({
                action: "modified",
                args: [{
                    uid: activeObject.uid,
                    object: activeObject
                }]
            });
        }
    };
}
}


/**
 * Returns unique id to attach to an object
 * @property null
 * @type string
 */

function uniqid() {
    var newDate = new Date;
    //  alert(newDate.getTime());
    return newDate.getTime();
}

function unhide(divID, className) {
    var item = document.getElementById(divID);
    if (item) {
        item.value = canvas.getActiveObject().text;
        item.className = className
    }
}

function drawPath(args) {

    // canvas.contextTop.closePath();
    canvas._isCurrentlyDrawing = false;
    var utilMin = fabric.util.array.min;
    var utilMax = fabric.util.array.max;
    var minX = utilMin(args._freeDrawingXPoints),
        minY = utilMin(args._freeDrawingYPoints),
        maxX = utilMax(args._freeDrawingXPoints),
        maxY = utilMax(args._freeDrawingYPoints),
        ctx = canvas.contextTop,
        path = [],
        xPoint, yPoint, xPoints = args._freeDrawingXPoints,
        yPoints = args._freeDrawingYPoints;

    path.push('M ', xPoints[0] - minX, ' ', yPoints[0] - minY, ' ');

    for (var i = 1; xPoint = xPoints[i], yPoint = yPoints[i]; i++) {
        path.push('L ', xPoint - minX, ' ', yPoint - minY, ' ');
    }

    // TODO (kangax): maybe remove Path creation from here, to decouple fabric.Canvas from fabric.Path, 
    // and instead fire something like "drawing:completed" event with path string
    path = path.join('');

    if (path === "M 0 0 L 0 0 ") {
        // do not create 0 width/height paths, as they are rendered inconsistently across browsers
        // Firefox 4, for example, renders a dot, whereas Chrome 10 renders nothing
        return;
    }

    var p = new fabric.Path(path);

    p.fill = null;
    p.stroke = fillColor;
    p.strokeWidth = 1;
    canvas.add(p);
    p.set("left", minX + (maxX - minX) / 2).set("top", minY + (maxY - minY) / 2).setCoords();
    canvas.renderAll();
    //this.fire('path:created', { path: p });
}

function colorHandler() {
    $("#colors").on("click", "td", function () {
        //alert($(this).attr('bgcolor'));//.toggleClass("chosen");
        fillColor = $(this).attr('bgcolor');
        $("#fColor").attr("bgcolor", fillColor);
        if (canvas.getActiveObject()) {
            // get currently selected object
            var obj = canvas.getActiveObject();
            // apply selected color for stroke
            obj.set("stroke", fillColor);
            modifyColor(obj, fillColor);
            canvas.renderAll();
            // TODO - send data to server
            matisse.sendDrawMsg({
                action: "modifyColor",
                args: [{
                    uid: obj.uid,
                    fillColor: fillColor
                }]
            })
            //alert(obj.uid);
            //delete obj;
        }
    });
}



/**
 * Grabs all the shape elements and creates a tool icon for each shape, to add in the toolbar
 *
 */

function addTools() {
    var toolsDiv = document.getElementById('toolsdiv')
    for (i in tools) {
        var el = document.createElement('div');
        var img = document.createElement('img');
        img.setAttribute('src', 'images/' + tools[i].displayIcon);
        img.setAttribute('id', tools[i].displayName);
        //img.setAttribute('width', "80%");
        //img.setAttribute('height', "80%");
        //img.setAttribute('class', "swapImage {src: \'images/"+tools[i].displayIcon2+"\'}");
        img.onclick = handleClick;
        //alert(img.src)
        el.appendChild(img);
        toolsDiv.appendChild(el);
    }

    //document.getElementById("drawing-mode").onclick = drawingButtonListener;
    document.getElementById("chatbutton").onclick = chatButtonListener;
    handleMouseEvents()
    $('#toolsdiv').draggable({
        cursor: 'move'
    });
    $('#texteditor').draggable({
        cursor: 'move'
    });
    $('#colorpicker').draggable({
        cursor: 'move'
    });
}

function keyDown(e) {
	var evt=(e)?e:(window.event)?window.event:null;
	if(evt){
		var key=(evt.charCode)?evt.charCode:
			((evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0));
		if(key=="46") {
			deleteObjects();
		}
	}
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
