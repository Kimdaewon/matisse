/**
 * User: Bhavani Shankar
 * Date: 01/19/12
 * Time: 11:16 AM
 * About this : This is the main javascipt file to handle adding, editing, deleting all elements on canvas (text, rectangle, circle etc)
 * Uses 'Fabric.js' library for client side
 * Node.js and  Node Package Manager (NPM) for server side - JavaScript environment that uses an asynchronous event-driven model.
 */
define(["matisse", "matisse.ui", "matisse.util", "matisse.fabric", "matisse.palettes", "matisse.events", "matisse.com", "matisse.palettes.properties", "matisse.toolbuttons.handlers"], function (matisse, ui, util, mfabric, palettes, events, com, properties, toolHandlers) {

    /**
     *	create canvas object
     */
    window.canvas = new fabric.Canvas('c', {
        backgroundColor: '#FFFFFF'
    });

    /**
     * by default selection mode is false 
     */
    canvas.isSelectMode = false;

    var main = {
        /**
         * Initializes the application
         * @method main.init
         * @param none
         *
         */
        init: function () {
            ui.initWidthAndHeightOfPanels();
            ui.resizeWindow();
            ui.setCanvasSize();
            ui.bindResizeWindow();
            canvas.isSelectMode = true;
            matisse.xOffset = util.getOffset(document.getElementById('canvasId')).left;
            matisse.yOffset = util.getOffset(document.getElementById('canvasId')).top;

            addTools();

            document.onkeydown = events.keyDown;
            $('#chaticon').click(toolHandlers.openChatWindow);
            $('#propicon').click(toolHandlers.openPropertiesPanel);

            toolHandlers.initChatWindow();

            addObservers();
            toolHandlers.saveButtonClickHandler();
            toolHandlers.newButtonClickHanlder();
        },

        /**
         *  Check for the active object or group object and remove them from canvas
         *  @method  deleteObjects
         *  @param none
         */
        deleteObjects: function () {
            var activeObject = canvas.getActiveObject(),
                activeGroup = canvas.getActiveGroup();

            if (activeObject) {
                canvas.remove(activeObject);
                com.sendDrawMsg({
                    action: "delete",
                    args: [{
                        uid: activeObject.uid
                    }]
                })
                $('#prop').remove();
            } else if (activeGroup) {
                var objectsInGroup = activeGroup.getObjects();
                canvas.discardActiveGroup();
                objectsInGroup.forEach(function (object) {
                    canvas.remove(object);
                });
            }
        },
        /**
         *  When receive a notification from server to modify the other side when it gets modified.
         *  @method  modifyObject
         *  @param rgs - received object and object's id.
         */
        modifyObject: function (args) {
            var obj = util.getObjectById(args[0].uid);            
            if (obj) {
                matisse.palette[obj.palette].shapes[obj.name].modifyAction ? matisse.palette[obj.palette].shapes[obj.name].modifyAction.apply(this, args) : null;
                canvas.setActiveObject(obj)
                properties.updatePropertyPanel(obj)
                obj.setCoords(); // without this object selection pointers remain at orginal postion(beofore modified)
            }
            canvas.renderAll();
        },
        /**
         * Draw free-hand drawing path when notification received from server
         * @method drawPath
         * @param args
         */
        drawPath: function (args) {
            var p = new fabric.Path(args.path);
            p.fill = null;
            p.stroke = '#FF000';
            p.strokeWidth = 1;
            p.uid = args.uid;
            p.name = "drawingpath";
            p.scaleX = 1;
            p.scaleY = 1;
            p.palette = "basic";
            p.set("left", args.left);
            p.set("top", args.top);
            p.set("width", args.width);
            p.set("height", args.height);
            canvas.add(p);
            canvas.renderAll();
            p.setCoords();
        },
        /**
         *  Handle MouseMove and MouseDown events - when user trying to draw a shape on canvas
         *  @method  handleMouseEvents
         *  @param none
         */
        handleMouseEvents: function () {			
			$('#canvasId').bind('mousedown', events.mouseDown);            
			$('#canvasId').bind('mousemove', events.mouseMove);            
        }
    } // end of 'return'    

    /**
     * Regiser observers to observe any object changes like resize, rotate, move etc
     * @method addObservers
     * @param none
     *
     */
    function addObservers() {
        mfabric.observe('object:modified');
        mfabric.observe('path:created');
        mfabric.observe('selection:cleared');
        mfabric.observe('object:moved');
        mfabric.observe('object:selected');
    }
	
    /**
     *  Sets the property of a shape when a notification received from server
     *  @method  setObjectProperty
     *  @param args
     */
    function setObjectProperty(args) {
        var obj = getObjectById(args.uid);
        if (obj) {
            obj.set(args.property, args.value);
            canvas.renderAll();
        }
    }

    /**
     * Grabs all the shape elements and creates a tool icon for each shape, to add in the toolbar
     * @method addTools
     * @param none
     */
    function addTools() {
        palettes.createAllPallettes(matisse.palette);
        $('#toolsdiv').append("<div id='deleteTool' class='tools deleteTool'></div>");
        $('#deleteTool').click(function () {
			console.log(this);
            deleteObjects();
        });
        $('#chatbutton').click(toolHandlers.chatButtonListener);		
        main.handleMouseEvents();
        $('#accordion').accordion();
        ui.setAccordinContentHeight();
    }
    return main;
})