$(document).ready(function(){
	
	$("#send").on("click", function(){
		let teamsize = parseInt($("#size").val());
		if (isNaN(teamsize) || teamsize <= 0) return -1;
		let names = $("#names").val();
		let sr = $("#sr").val();
		names = parseInput(names);
		sr = parseInput(sr);
		console.log(sr)
		sr = sr.map(a => parseInt(a));
		if(isNaN(sr[sr.length-1])) sr.pop();
		//console.log(parser, names, sr);
		const pool = sr.length;
		let best = 999999, bestTeam, exclude, bestExclude, teamSR, i, r = 0, choice, temparr, diff = 400, average, j, teams = [], arr = [];
		/*for(i = 0; i < pool; i++){
			let n = Math.floor(Math.random()*1000);
			arr.push(n);
		}*/
		
		while(diff >= 300 && r != 100000){
			for(let h = 0; h < Math.floor(pool/teamsize)+1; h++){
				teams.push([]);
			}
			average=[];
			temparr = sr.slice();
			i = 0;
			choice = 0;
			j = 1
			while(temparr.length != 0){
				choice = Math.floor(Math.random()*temparr.length);
				teams[i].push(temparr[choice]);
				temparr.splice(choice, 1);
				if(j === 6){ i++;j = 0;}
				j++;
			}
			if (teams[i].length != teamsize) exclude = teams.pop();
			average = teams.map(team => team.reduce(function(sum, val){return sum+val;}));
			diff = average.reduce(function(a,b){return Math.max(a,b)}) - average.reduce(function(a,b){return Math.min(a,b)});
			if (diff < best) {bestTeam = teams.slice(); best = diff; bestExclude = exclude;teamSR = average}
			r++;
			teams = [];
		}
		//pop used ones here
		generatedTeams = bestTeam.map(team => team.map(player => {
			let index = sr.indexOf(player);
			let name = names[sr.indexOf(player)];
			sr.splice(index, 1);
			names.splice(index,1);
			return {"name":name, "sr": player}
		}));
		console.log(generatedTeams, names);
		let teamOutput = "Teams:<br>";
		for(i = 0; i < generatedTeams.length; i++){
			teamOutput += "Team " + (i+1) + " Average Sr: " + Math.floor(teamSR[i]/teamsize);
			for(j = 0; j < generatedTeams[i].length; j++){
				teamOutput += "<br>" + generatedTeams[i][j].name + ", " + generatedTeams[i][j].sr + " sr"; 
			}
			teamOutput += "<br>"
		}
		$("#teamDisplay").html(teamOutput);
		
		//console.log(diff, i, j, r);
		//console.log(bestTeam, best, bestExclude);
	});
	function parseInput(input){
		parser = input.replace(/(\s)+/gim, ";")
		return parser.split(";");
	}
});