var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var topic = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (eventbody){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var polygon=JSON.parse(eventbody.body);
        ctx.fillStyle = '#2629ff';
        ctx.beginPath();
        ctx.moveTo(polygon[0].x,polygon[0].y);
        for (var i=1;i<polygon.length;i++) {
            ctx.lineTo(polygon[i].x,polygon[i].y);
        }
        ctx.closePath();
        ctx.fill();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, async function (frame) {
            console.log('Connected: ' + frame);
            await stompClient.subscribe('/topic/newpoint.' + topic, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                //alert("coordenada x : " + theObject.x + "  coordenada y :" + theObject.y);
                addPointToCanvas(new Point(theObject.x,theObject.y));
            });
            stompClient.subscribe('/topic/newpolygon.' + topic, async function (eventbody){
                addPolygonToCanvas(eventbody);
            });
        });

    };


    var eventCanvas = function(event) {
        let coordenadas = getMousePosition(event);
        app.publishPoint(coordenadas.x,coordenadas.y);
    };
    

    return {

        init: function () {
            var canvas = document.getElementById("canvas");
            ctx = canvas.getContext("2d");
            if(window.PointerEvent){
                canvas.addEventListener("pointerdown", eventCanvas);
            }else{
                canvas.addEventListener("mousedown", eventCanvas);
            }

            //websocket connection
            //connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt);
            stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },


        topicSuscription: function (topicid){
            topic = topicid;
            connectAndSubscribe();
        }
    };

})();