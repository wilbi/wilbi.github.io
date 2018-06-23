$(document).ready(function(){
/*This method is better for small datasets*/
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
		if(names.length != sr.length) names.pop();
		const pool = sr.length;
		let best = 999999, bestTeam, exclude, bestExclude, teamSR, i, r = 0, choice, temparr, diff = 400, average, j, teams = [], arr = [];
		while(best >= 100*teamsize && r != 100000){
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
			average = teams.map(team => team.reduce(function(sum, val){return sum+val;},0));
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
		console.log("loop done", r)
		//Generate JSON out of the data because json is nice
		generatedTeams = bestTeam.map(team => team.map(player => {
			let index = sr.indexOf(player);
			let name = names[sr.indexOf(player)];
			sr.splice(index, 1);
			names.splice(index,1);
			return {"name":name, "sr": player}
		}));
		//Formulate the eventual output
		let teamOutput = "Average Difference: " + Math.floor(best/teamsize) + " Teams:\n";
		for(i = 0; i < generatedTeams.length; i++){
			teamOutput += "Team " + (i+1) + " Average Sr: " + Math.floor(teamSR[i]/teamsize);
			for(j = 0; j < generatedTeams[i].length; j++){
				teamOutput += "\n" + generatedTeams[i][j].name + ", " + generatedTeams[i][j].sr + " sr";
			}
			teamOutput += "\n"
		}

		$("#teamDisplay").html(teamOutput);
	});
	
	$("#testData").on("click", () => {
		let names = [];
		let srs = [];
		for(let i = 0; i < 32; i++){
			names.push(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,7));
			srs.push((Math.floor(norm()*2500)+2500));
		}
		$("#names").append(names.map((name) => { return name + '\n'}));
		$("#sr").append(srs.map((sr) => {return sr + '\n'}));
	})
	function parseInput(input){
		parser = input.replace(/(\s)+/gim, ";")
		return parser.split(";");
	}
	let norm = () => {
		return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
	}
/*This method is better for large datasets*/
	$("#alg").on("click", () => {
		let teamsize = parseInt($("#size").val());
		if (isNaN(teamsize) || teamsize <= 0) return -1;
		let names = $("#names").val();
		let sr = $("#sr").val();
		names = parseInput(names);
		sr = parseInput(sr);
		sr = sr.map(a => parseInt(a));
		if(isNaN(sr[sr.length-1])) sr.pop();
		if(names.length != sr.length) names.pop();

		const pool = sr.length;
		let teamSR = 0, choice, arr = [], poolSize;
		poolSize = Math.floor(names.length/teamsize);
		let teams = []//Array(poolSize).fill(new Array());
		for(let i = 0; i < pool; i++){
			let name = names.pop();
			let rank = sr.pop();
			arr.push({"name":name, "rank":rank});
		}
		arr.sort((a,b) => {
			if(a.rank < b.rank) return -1;
			if(a.rank > b.rank) return 1;
			return 0;
		})
		let pools = [];
		for(let i = 0; i<teamsize; i++){
			pools.push(arr.splice(0,Math.min(arr.length, poolSize)))
		}
		/* Divide in to teams */
		for(let i = 0; i<poolSize; i++){
			teams.push([]);
			for(let j = 1; j < teamsize-1; j++){
				teams[i].push(pools[j].splice(Math.floor(pools[j].length/2),+1)[0])
			}
			teams[i].push(pools[0].splice(0,1)[0]);
			teams[i].push(pools[teamsize-1].pop());
			teams[i].avgSr = Math.floor(
			teams[i].reduce((totalRanking, member) =>
											{return member.rank+totalRanking},0)/teamsize);
			teamSR += teams[i].avgSr;
		}
		/*Calculate interesting stats */
		teamSR = Math.floor(teamSR/poolSize);
		teams.sort((a,b) => {
			if(a.avgSr < b.avgSr)return -1;
			if(a.avgSr > b.avgSr)return 1;
			return 0;
		});
		console.log(teams[poolSize-1].avgSr-teams[0].avgSr, teamSR)
	})
});
