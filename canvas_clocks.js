/*TODO
implement canvas, purely javascript built, 1st clock based on a real world Timex Wrist watch ***DONE***
figure out best way to encapsulate each clock type settings, implement encapsulation --- JSON,classes?
*/

/*DEVNOTES
--find out which marker solution works best across all browsers
--problem, hour numerals position are hardcoded, maybe a different solution should be searched
--possibly useful website http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
*/


function init(){

	//---------------------------------

	//Clock object definition

	var Clock = function (type,light,lightColor,dimensions,context1,context2){
		
		//CLock object properties

		this.type = type;
		this.time = this.setTime();
		this.hasLight = light;
		this.lightOn = false;
		this.lightColor = lightColor;
		this.dimensions = dimensions;
		this.staticContext = context1;
		this.dynamicContext = context2;
	
	}

	//sets the clock time array [hours,minutes,seconds]

	Clock.prototype.setTime = function(){ this.time = calculate_time(); }

	//gets the clock time array [hours,minutes,seconds]

	Clock.prototype.getTime = function(){ return this.time; }

	//methods changeslightState from what it currently is

	Clock.prototype.changeLightState = function(){
		if (!this.lightOn){
			this.lightOn = true;
		}
		else{
			this.lightOn = false;
		}
	}

	//method gets current light state

	Clock.prototype.getLightState = function(){ return this.lightOn; }

	//methods calls drawing functions

	Clock.prototype.draw = function(){

		//static clock draw uses canvas workbench_layer1

		static_clockGraphics_draw(this.staticContext);

		//fix assigns context Math.PI*3/2 to start angle
		//enables easier clocks needles positioning

		this.dynamicContext.translate(200,200);
		this.dynamicContext.rotate(-90*Math.PI/180);

		//dynamic clock part draw uses canvas workbench_layer2

		var ctxDyn = this.dynamicContext;

		//animationFrame call for the dynamic clock part draw

		AnimationId = requestAnimationFrame( function () { dynamic_clockGraphics_draw(ctxDyn) } );
	}


	//dynamic canvas,ctx initialization

	var canvas = document.getElementById('workbench_layer1');
	var ctx1 = canvas.getContext('2d');

	//dynamic canvas,ctx initialization

	var canvas = document.getElementById('workbench_layer2');
	
	
	var ctx2 = canvas.getContext('2d');

	//Clock object initialization

	myClock = new Clock("analog",true,"rgba(112,250,149,0.3)",null,ctx1,ctx2);

	//attaching event listeners to canvas

	canvas.addEventListener('mousedown',ClockLight);
	canvas.addEventListener('mouseup',ClockLight);

	//clock draw function call

	myClock.draw();


}

function ClockLight(event){

	//clock changesLightState if left mouse button is pressed
	//console.log(event.type);

	if (event.button == 0){
		if (event.type == "mousedown" && !myClock.getLightState()) { myClock.changeLightState(); }
		if (event.type == "mouseup" && myClock.getLightState()) { myClock.changeLightState(); }
	}
}

function calculate_time(){

	//creates Date object

	var d = new Date();

	//calls Date object methods to obtain hour,minute,seconds

	var seconds = d.getSeconds();
	var minutes = d.getMinutes();
	var hours = d.getHours();

	//array with hours,minutes,seconds
	
	var time = [hours,minutes,seconds];

	return time;
}

function static_clockGraphics_draw(ctx){

	//static clock graphics

	//translates context so arc can be drawn from 0,0 position

	ctx.translate(200,200);

	ctx.save();
	ctx.shadowColor = "black";
	ctx.shadowBlur = 2;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	
	//outer arc gradient

	var gradient = ctx.createRadialGradient(0,0,90,0,0,0);
	gradient.addColorStop(0,'rgba(232,232,232,1)');
	gradient.addColorStop(0.1,'black');
	gradient.addColorStop(1,'black');
	ctx.fillStyle = gradient;

	//ctx.fillRect(0,0,100,100);

	//outer arc
	ctx.arc(0,0,92,0,Math.PI*2);
	ctx.strokeStyle = gradient;
	ctx.lineWidth = 12;
	ctx.stroke();

	//inner circle
	ctx.restore();
	//ctx.beginPath();
	//ctx.arc(0,0,60,0,Math.PI*2);
	//ctx.fillStyle = "white";
	//ctx.fill();

	//inner clock text

	ctx.font = "7pt Calibri";
	ctx.textAlign = "center";
	ctx.fillText("TIMEX",0,-28);
	ctx.font = "6pt Calibri";
	ctx.fillText("INDIGLO",0,28);
	ctx.fillText("WR30M",0,35);



	//solution to hour markers with ctx.arc()
	/*for(x=1;x<=12;x++){
		ctx.beginPath();
		ctx.arc(200,200,75,(x/12*Math.PI*2)-0.015,(x/12*Math.PI*2)+0.015,false);
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 6;
		ctx.stroke();
	}*/

	//solution to hour markers with ctx.lineTo(), ctx.translate(), ctx.rotate()
	//ctx.save();

	// draws outer clock markers

	for(x=0;x<60;x++){
		//ctx.save();
		//ctx.rotate(x/60*Math.PI*2);
		ctx.beginPath();
		if ( x%5 == 0 ){
			ctx.moveTo(0,-76);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#1F1E1E";
		}
		else{
			ctx.moveTo(0,-76);
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#1F1E1E";
		}
		ctx.lineTo(0,-80);
		ctx.stroke();
		ctx.rotate(Math.PI*2/60);//ctx.save();ctx.rotate(x/60*Math.PI*2);ctx.restore(); ? 
		//ctx.restore();
	}
	

	//numerals text configuration

	ctx.font = "15pt Calibri";
	ctx.lineWidth = 1;
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.strokeStyle = '#000000';

	
	//solution found for text writing in arc with a straight text baseline

	for(x=1;x<=12;x++){
		ctx.rotate(x/12*Math.PI*2);
		ctx.translate(0,-64);
		var text = x.toString();
		ctx.rotate(-1*x/12*Math.PI*2);
		
		//auxiliary function with different fillText positions for each hour text marker

		var pos = TextAux(ctx,text); 
		ctx.fillText(text,pos[0],pos[1]);
		ctx.rotate(x/12*Math.PI*2);
		ctx.translate(0,64);
		ctx.rotate(-1*x/12*Math.PI*2);
	}

}

function dynamic_clockGraphics_draw(ctx){

	//dynamic region clearing

	ctx.beginPath();
	ctx.arc(0,0,85,0,Math.PI*2);
	ctx.clip();
	ctx.clearRect(-90,-90,180,180);


	//light on light off

	if ( myClock.lightOn ){

		ctx.fillStyle = myClock.lightColor;
		ctx.fill();
	}

	//get time values

	var time = calculate_time();

	//neddle movement angles

	var sec_arc_angle = 2*Math.PI*time[2]/60;
	var min_arc_angle = 2*Math.PI*time[1]/60;
	var hour_arc_angle = 2*Math.PI*time[0]/12+(2*Math.PI*1/12)*(time[1]/60); 
	//the added parcel allows for hour needle to change withing the hour as it comes closer each draw to the next hour

	//needle sizes

	var hours_needle_size = 44;
	var minutes_needle_size = 64;
	var seconds_needle_size = 68;
	var back_edge_size = 20;

	//seconds needle lineTo x,y values

	var sec_x_thinner_edge = (seconds_needle_size*Math.cos(sec_arc_angle));
	var sec_y_thinner_edge = (seconds_needle_size*Math.sin(sec_arc_angle));

	var sec_x_back_edge_size = -(back_edge_size*Math.cos(sec_arc_angle));
	var sec_y_back_edge_size = -(back_edge_size*Math.sin(sec_arc_angle));

	//minutes needle lineTo x,y values

	var min_x_thinner_edge = (minutes_needle_size*Math.cos(min_arc_angle));
	var min_y_thinner_edge = (minutes_needle_size*Math.sin(min_arc_angle));

	var min_x_back_edge_size = -(back_edge_size*Math.cos(min_arc_angle));
	var min_y_back_edge_size = -(back_edge_size*Math.sin(min_arc_angle));

	//hours needle lineTo x,y values

	var hour_x_thinner_edge = (hours_needle_size*Math.cos(hour_arc_angle));
	var hour_y_thinner_edge = (hours_needle_size*Math.sin(hour_arc_angle));

	var hour_x_back_edge_size = -(back_edge_size*Math.cos(hour_arc_angle));
	var hour_y_back_edge_size = -(back_edge_size*Math.sin(hour_arc_angle));

	//hour, minutes needle configuration

	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "black";

	//hour needle

	ctx.moveTo(0,0);
	ctx.lineTo(hour_x_back_edge_size,hour_y_back_edge_size);
	ctx.moveTo(0,0);
	ctx.lineTo(hour_x_thinner_edge,hour_y_thinner_edge);
	ctx.stroke();

	//minutes needle

	ctx.moveTo(0,0);
	ctx.lineTo(min_x_back_edge_size,min_y_back_edge_size);
	ctx.moveTo(0,0);
	ctx.lineTo(min_x_thinner_edge,min_y_thinner_edge);
	ctx.stroke();

	//seconds needle

	ctx.beginPath();
	ctx.strokeStyle = "#9C9B9E";
	ctx.moveTo(0,0); 
	ctx.lineTo(sec_x_back_edge_size,sec_y_back_edge_size); //thicker back edge
	ctx.stroke();
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.moveTo(0,0);
	ctx.lineTo(sec_x_thinner_edge,sec_y_thinner_edge); //thiner back edge
	ctx.stroke();

	//central arc

	ctx.beginPath();
	ctx.fillStyle = "#595659";
	ctx.arc(0,0,3,0,2*Math.PI); //arc
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#9C9B9E";
	ctx.stroke();

	AnimationId = requestAnimationFrame( function () { dynamic_clockGraphics_draw(ctx) } );

}



function TextAux(ctx,text){

	var pos;

	switch(text){

		case "1":
			var pos = [-1,2];
			//ctx.fillText(text,-1,2);
			break;
		case "2":
			var pos = [-1,1];
			//ctx.fillText(text,-1,1);
			break;
		case "3":
			var pos = [0,2];
			//ctx.fillText(text,0,2);
			break;
		case "4":
			var pos = [-1,2];
			//ctx.fillText(text,-1,2);
			break;
		case "5":
			var pos = [0,1];
			//ctx.fillText(text,0,1);
			break;
		case "6":
			var pos = [0,1];
			//ctx.fillText(text,0,1);
			break;
		case "7":
			var pos = [1,0];
			//ctx.fillText(text,0,1);
			break;
		case "8":
			var pos = [0,1];
			//ctx.fillText(text,-1,1);
			break;
		case "9":
			var pos = [0,2];
			//ctx.fillText(text,0,2);
			break;
		case "10":
			var pos = [4,3];
			//ctx.fillText(text,4,3);
			break;
		case "11":
			var pos = [3,4];
			//ctx.fillText(text,2,3);
			break;
		case "12":
			var pos = [0,4];
			//ctx.fillText(text,0,3);
			break;
	}
	return pos;
}