$(function(){
	var canvas = document.getElementById("canvas"),
	cv = canvas.getContext("2d");
	// var time = null;


	$("#box").fullpage({
		sectionsColor : ["red","green","blue","orange"],
		anchors: ["page1", "page2", "page3", "page4"],
		navigation : true,
		afterLoad : function(anchorLink,index){
			// 控制nav
			$("nav ul li a").eq($("body")[0].className ? $("body")[0].className.match(/\d/) - 1 : 0).addClass("on").parent().siblings().children().removeClass();

			if(index == 1){
				$(".page1 img").removeClass("bounceOutDown").addClass("bounceInDown");
				$(".present p").removeClass("fadeOut");
				var next = 0;
				var timer1 = null;
				clearInterval(timer1);
				timer1 = setInterval(function(){
					addClass(next,"bounceInRight");
					next == 3 ? clearInterval(timer1) : next++;
				},500)
			}else if(index == 2){
				var text = "首先先给各位考官问好，很荣幸能有机会向各位进行自我介绍。我叫xxx，今年xxx岁，我学的是xxx专业。这次来应聘我觉得自己有能力胜任这份工作，并且有着浓厚的兴趣，xxx的基本工作已经熟练，如果能给我个机会，我一定会在工作中好好地表现的，一定不会 让你们失望。 我很乐意回答各位考官所提出来的任何问题，谢谢！";
				$(".write").text("").removeClass("zoomOutDown");
				write($(".write")[0],text);
		
			}else if(index == 3){

			}else if(index == 4){
				cTime1 = null;
				cTime2 = null;
				circle(cv,200,200,0.8,cTime1);
				circle(cv,800,200,1,cTime2);
			}
		},
		onLeave : function(index,nextIndex,direction){
			if(index == 1){
				$(".page1 img").removeClass("bounceInDown").addClass("bounceOutDown");
				$(".present p").removeClass("bounceInRight").addClass("fadeOut");
			}else if(index == 2){
				$(".write").addClass("zoomOutDown");
			}else if(index == 3){

			}else if(index == 4){
				clearInterval(cTime1);
				cv.clearRect(0,0,1000,600);
			}
		}
	});

	function addClass(next,name){
		$(".present p").eq(next).addClass(name);
		next++;
	}

	var timer = null;
	function write(obj,txt){
		var text = txt;
		var num = -1;
		clearInterval(timer);
		timer = setInterval(function(){
			obj.innerHTML += "_";
			var str = obj.innerHTML.slice(0,(obj.innerHTML.length-1));
			obj.innerHTML = str;
			if(num < text.length-1){
				setTimeout(function(){
					var str = obj.innerHTML.slice(0,(obj.innerHTML.length-1));
					obj.innerHTML = str;
				},10);
				setTimeout(function(){
					obj.innerHTML += text[num] + "_";
				},20);
			}else{
				var str = obj.innerHTML.slice(0,(obj.innerHTML.length-1));
				obj.innerHTML = str;
				clearInterval(timer);
			}
			num++;
		},30);
	}

	function circle(cv,x,y,deg,t){
		var deg = deg * 360;
		var index = 0;

		cv.lineWidth = 5;
		clearInterval(t);
		t = setInterval(function(){
			if(index == deg){
				cv.stroke();
				clearInterval(t);
			}else{
				index++;
				cv.beginPath();
				cv.arc(x,y,200,0,index/180*Math.PI);
				cv.stroke();
			}
		},10);
	};
})