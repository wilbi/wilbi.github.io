$(document).ready(function(){
	
	$("#send").on("click", function(){
		//sanity checks on user input
		let teamsize = parseInt($("#size").val());
		if (isNaN(teamsize) || teamsize <= 0) return -1;
		let names = $("#names").val();
		let sr = $("#sr").val();
		names = parseInput(names);
		sr = parseInput(sr);
		sr = sr.map(a => parseInt(a));
		if(isNaN(sr[sr.length-1])) sr.pop();
		if(names.length != sr.length) return -1;
		const pool = sr.length;
		let best = 999999, bestTeam, exclude, bestExclude, teamSR, i, r = 0, choice, temparr, diff = 400, average, j, teams = [], arr = [];
		
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
				if(j === teamsize){ i++;j = 0;}
				j++;
			}
			if (teams[i].length != teamsize) exclude = teams.pop();
			average = teams.map(team => team.reduce(function(sum, val){return sum+val;}));
			diff = average.reduce((a,b) => Math.max(a,b)) - average.reduce((a,b) => Math.min(a,b));
			if (diff < best) {
				bestTeam = teams.slice();
				best = diff;
				bestExclude = exclude;
				teamSR = average
			}
			r++;
			teams = [];
		}
		//Generate JSON out of the data because json is nice
		generatedTeams = bestTeam.map(team => team.map(player => {
			let index = sr.indexOf(player);
			let name = names[sr.indexOf(player)];
			sr.splice(index, 1);
			names.splice(index,1);
			return {"name":name, "sr": player}
		}));
		//Formulate the eventual output
		let teamOutput = "Teams:<br>";
		for(i = 0; i < generatedTeams.length; i++){
			teamOutput += "Team " + (i+1) + " Average Sr: " + Math.floor(teamSR[i]/teamsize);
			for(j = 0; j < generatedTeams[i].length; j++){
				teamOutput += "<br>" + generatedTeams[i][j].name + ", " + generatedTeams[i][j].sr + " sr"; 
			}
			teamOutput += "<br>"
		}
		$("#teamDisplay").html(teamOutput);
	});
	function parseInput(input){
		parser = input.replace(/(\s)+/gim, ";")
		return parser.split(";");
	}
});