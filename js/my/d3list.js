define(['jquery','d3'], function($,d3){

	var 
	
		startpos   = 0,
		
		rectmargin = 30,
		
		pointerwidth = 35,
		
		transitionduration = 1000,
		
		draggedcontainer,
		
		colours		 = ["#880e4f","#c2185b", "#e91e63", "#f06292", "#f8bbd0"],
		
		mydata = [{position: 1, value: "greggs"},
				  {position: 2, value: "birds"}, 
				  {position: 3, value: "asda"},
				  {position: 4, value: "coop"},
				  {position: 5, value: "tesco"},],
				  
		margin    = {top:20, right:pointerwidth+10, bottom:20,left:35},
		
		width 	  = 300 - margin.left - margin.right,
		
	  	height    = 350 - margin.top - margin.bottom,
		
	  	svg  = d3.select("#list").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),	
	  
	  	y = function(position){
	  		return (position - 1) * (height/mydata.length);
	  	},
	  	
	  	cy = function(position){
	  		return ((position - 1) * (height/mydata.length)) + ((height/mydata.length) / 2) - rectmargin/2;
	  	},
	  
	  	calcpos = function(ypos){
	  		return Math.max(0,Math.min(mydata.length-1,(ypos/height) * mydata.length));
	  	},
	  	
	  	colour = function(ypos){
	  		return colours[ypos%colours.length];	
	  	},
	  	
	  	highlighted = function(ypos){
	  		return "#e51c23";
	  	},
	  	
	  	multiplier = function(ypos){
	  		return 0.7 + (0.3 * (1 - (ypos/mydata.length)));
	  	},
	  	
	  	dragstart = function(d){
	  		
	  		startpos = (d.position - 1);
	  		currentpos = startpos;
	  		draggedcontainer = d3.select("g." +  mydata[startpos].value);
	   		
	  		draggedcontainer.select("rect")
	  			.style("fill", highlighted(startpos))
	  			.style("stroke", highlighted(startpos));
	  		
	  		
	  		//make any previously selected pointers transparent
	  		var listitems = d3.selectAll("g.listitem");
	  		
	  		var pointers = listitems.selectAll("g")
	  		
	  		pointers.selectAll("circle")
	  			.style("stroke-opacity", 0.0)	
	  			.style("fill-opacity", 0.0)	
	  		
	  		pointers.selectAll("line")
	  			.style("stroke-opacity", 0.0)
	  				
	  		//now make the current pointer opaque	
	  		var pointer = draggedcontainer.select("g")
	  		
	  		pointer.selectAll("circle")
	  			.style("stroke-opacity", 1.0)	
	  			.style("fill-opacity", 1.0)	
	  		
	  		pointer.selectAll("line")
	  			.style("stroke-opacity", 1.0)	
	  			
	  	},
	  	
	  	moveneighbour = function(pos){
	  		
	  		var neighbourcontainer = d3.select("g." +  mydata[pos].value);
			var newpos = -1;
			
			 
			if (pos > startpos && pos > 0 && pos < mydata.length){	
				newpos = mydata[pos].position - 1;
				mydata[pos].position = newpos;
				mydata[startpos].position += 1;				
			}
			else if (pos < startpos && pos >= 0 && pos < mydata.length-1){	
				newpos = mydata[pos].position + 1;
				mydata[pos].position = newpos;
				mydata[startpos].position -= 1;
			}
		
			if (newpos == -1){
				return;
			}
				
			neighbourcontainer.select("circle.outer")
					.transition()
					.duration(transitionduration)
					.attr("r", multiplier(newpos) * ((height/mydata.length) / 2) - 4)
					.attr("cy", cy(newpos))
				
			neighbourcontainer.select("circle.inner")
					.transition()
					.duration(transitionduration)
					.attr("r", multiplier(newpos) * ((height/mydata.length) / 2) - 7)
					.attr("cy", cy(newpos))
					.style("fill", "#fff")
					.style("stroke",function(d){return colour(newpos-1)})
		
			neighbourcontainer.select("text")
					.transition()
					.duration(transitionduration)
					.attr("y", function(d){return cy(newpos)})
					.attr("font-size", function(d){return multiplier(newpos) * 35 + "px"})	
					.text(function(d){return newpos})
				
			neighbourcontainer.select("rect")
					.transition()
					.duration(transitionduration)
					.attr("y", y(newpos))
					.style("fill",function(d){return colour(newpos-1)})	
					.style("stroke",function(d){return colour(newpos-1)})	
		
			neighbourcontainer.select("g")
					.selectAll("circle")
					.transition()
					.duration(transitionduration)
					.attr("cy", cy(newpos))
		
			neighbourcontainer.select("g")
					.select("line")
					.transition()
					.duration(transitionduration)
					.attr("y1", cy(newpos))
					.attr("y2", cy(newpos))	

	  	}
	  	
	  	dragit = function(d){
	  		
	  		
	  		currentpos = parseInt(calcpos(d3.event.y + (height/mydata.length)/2));
	  		
	  		//shift the rects above or below down/up
		
	  		if(Math.abs(currentpos-startpos) >= 1){ //if there has been some kind of movement
	  			if (currentpos > startpos){
	  				for (var i = startpos+1; i <= currentpos; i++){
	  					moveneighbour(i); //this is fine!
	  				}
	  				
	  			}else{
	  				for (var i = startpos-1; i >= currentpos; i--){
	  					moveneighbour(i);
	  				}
	  			}
	  		 	mydata.sort(function(a,b){return a.position > b.position})
	  			startpos = currentpos;
	  		}	
	  		
	  		vcenter   = (height/mydata.length)/2 - (rectmargin/2);
	  		maxheight = height - vcenter;
	  		
	  		draggedcontainer.select("rect")
	   			.attr("x", d.x = 0)
	   			.attr("y", d.y = Math.min(maxheight, Math.max(0,d3.event.y)))
	   		

			draggedcontainer.selectAll("circle.ranking")
				.attr("cx", d.x = 0)
				.attr("cy", d.y = Math.min(maxheight + vcenter, Math.max(vcenter, d3.event.y + vcenter)))
	  		
	  		
	  		draggedcontainer.select("g").selectAll("circle")
	  			.attr("cy", function(d){return Math.min(maxheight+vcenter,
	  													Math.max(vcenter, d3.event.y + vcenter))});
	  		
	  		draggedcontainer.select("g").selectAll("line")
	  			
	  			.attr("y1", function(d){return Math.min(maxheight + vcenter,
	  										    		Math.max(vcenter, d3.event.y + vcenter))})
	  			
	  			.attr("y2", function(d){return Math.min(maxheight + vcenter,
	  										    		Math.max(vcenter, d3.event.y + vcenter))});							  	
	  			
			draggedcontainer.select("text")
				.attr("y", function(d){return Math.min(maxheight+vcenter,
	  													Math.max(vcenter, d3.event.y + vcenter))})
	  			.text(function(d){return mydata[currentpos].position})

	   	},
	   			
	   	
	   	dragend = function(d,i){
	   	
	   		draggedcontainer.select("rect")
	  				.attr("y", y(mydata[currentpos].position))	
	  		
	  		draggedcontainer.select("rect")
	  				.transition()
	  				.duration(transitionduration)
	  				.style("fill", colour(currentpos))
	  				.style("stroke", colour(currentpos));
	  		
	  	    draggedcontainer.selectAll("circle.ranking")
	  				.attr("cy", cy(mydata[currentpos].position))
	  				
	  		draggedcontainer.select("circle.outer")
	  				.attr("r", multiplier(mydata[currentpos].position) * ((height/mydata.length) / 2) - 4)
	  				
	  				
	  		draggedcontainer.select("circle.inner")
	  				.attr("r", multiplier(mydata[currentpos].position) * ((height/mydata.length) / 2) - 7)
	  				.style("fill", "#fff")
	  				.style("stroke",function(d){return colour(d.position - 1)})
	  		
	  		draggedcontainer.select("text")
				.attr("y", function(d){return cy(mydata[currentpos].position)})
	  			.attr("font-size", function(d){return multiplier(currentpos) * 35 + "px"})	
	  		//	.text(function(d){return mydata[currentpos].position})
	  		
	  		var pointer   = draggedcontainer.select("g");
	  		
	  		pointer.selectAll("circle")
	  				.attr("cy", cy(mydata[currentpos].position));
	  		
	  		pointer.select("circle.inner")
	  				.style("fill", function(d){return colour(d.position-1)});
	  				
	  		pointer.selectAll("line")
	  				.attr("y1", cy(mydata[currentpos].position))
	  				.attr("y2", cy(mydata[currentpos].position))	
	  				.style("stroke", function(d){return colour(d.position-1)});
	  					
	   	},
	   	
	   	drag = d3.behavior.drag()
	   			  .on("dragstart", dragstart)
	   			  .on("drag", dragit)
	   			  .on("dragend", dragend)
	   	
	   	
	     
	  	renderlist = function(){
	  		
	  		var itemheight = height/mydata.length;
	  		var vcenter    = (itemheight / 2) - rectmargin/2;
	  		
	  		var list = svg.selectAll(".mylist")
	  					.data(mydata)
	  					
	  		var container = list.enter()
	  						.append("g")
	  						.attr("class", function(d){return d.value + " listitem"})
	  						
	  		container
	  			.append("rect")
	  			.attr("rx", 8)
	  			.attr("ry", 8)
	  			.attr("x", function(d){return 0})
	  			.attr("y", function(d){return (d.position - 1) * itemheight})
	  			.attr("width" , function(d){return width-pointerwidth})
	  			.attr("height", function(d){return itemheight-rectmargin})
	  			.style("fill", function(d){return colour(d.position - 1)})
	  			.style("stroke", function(d){return colour(d.position - 1)})
	  			.style("stroke-width", 3)
	  			.style("fill-opacity", 1.0)	
				.style("stroke-opacity", 1.0)
				.call(drag)	
	  
	  			
	  		container
	  			.append("circle")
	  			.attr("class", "ranking outer")
	  			.attr("cx", function(d){return 0})
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return multiplier(d.position-1) * (itemheight / 2) - 4})
	  			.style("fill", "#fff")
	  			.style("stroke", "#fff" )
	  			.style("stroke-width", 4)
	  			.style("fill-opacity", 1.0)	
				.style("stroke-opacity", 1.0)
	  			.call(drag)	
	  		
	  		container
						.append("circle")
						.attr("class", "ranking inner")
						.attr("cx", function(d){return 0})
						.attr("cy", function(d){return cy(d.position)})
						.attr("r", function(d){return multiplier(d.position-1) * (itemheight / 2) - 7})
						.style("fill", "#fff")
						.style("stroke",function(d){return colour(d.position - 1)})
						.style("stroke-width", 4)
						.style("fill-opacity", 1.0)	
						.style("stroke-opacity", 1.0)
						.call(drag)	
	  		
	  		container
	  			.append("text")
	  			.attr("class", "rank")
	  			.attr("text-anchor", "middle")
	  			.attr("y", function(d){return cy(d.position)})
	  			.attr("dy", ".35em")
	  			.attr("font-size", function(d){return multiplier(d.position-1) * 35 + "px"})
	  			.text(function(d){return d.position})
	  			
	  				
	  		var pointer = container
	  			.append("g")

	  		
	  		pointer.append("circle")
	  			.attr("class", "outer")
	  			.attr("cx", function(d){return width + pointerwidth - (itemheight / 2) })
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return ((height/mydata.length) / 2)})
	  			.style("fill", "#262238")
	  			.style("stroke", "#fff")
	  			.style("stroke-width", 4)
	  			.style("stroke-opacity", 0.0)	
	  			.style("fill-opacity", 0.0)	
	  			
	  		pointer.append("circle")
	  			.attr("class", "inner")
	  			.attr("cx", function(d){return width + pointerwidth - ((height/mydata.length) / 2) })
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return ((height/mydata.length) / 4)})
	  			.style("fill", function(d){return colour(d.position - 1)})
	  			.style("stroke", "#fff")
	  			.style("stroke-width", 8)
	  			.style("stroke-opacity", 0.0)	
	  			.style("fill-opacity", 0.0)	
	  		
	  		pointer.append("line")
	  			.attr("y1", function(d){return cy(d.position)})
				.attr("x1", function(d){return width - pointerwidth})
				.attr("y2", function(d){return cy(d.position)})
				.attr("x2", function(d){return width + pointerwidth - (itemheight / 2) })
	  			.style("stroke", function(d){return colour(d.position - 1)})
	  			.style("stroke-width", 3)
	  			.style("stroke-opacity", 0.0)
	  		
	  			
	  	},
	  	
	  	init = function(){
			renderlist();
	  	}

	return {
		init:init,
	}

});
